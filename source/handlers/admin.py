from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_, func
import dal.models as models
from handlers.base.pub_web import AdminBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float, PubMethod
import requests, json , datetime
from handlers.celery_autowork_task import export_statistic_data_and_mail
from handlers.common import UpdateWebSocket

class Home(AdminBaseHandler):
    def get(self):
        return self.render("admin/index.html")

    @AdminBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        if action in ["add_analyze_request","edit_analyze_request"]:
            return self.add_or_edit_analyze(action)
        elif action=="get_analyze_list":
            return self.get_analyze_list()
        else:
            return self.send_fail(403)

    # 法医添加或者编辑记录
    @AdminBaseHandler.check_arguments("analyze_id?:int","patient_name:str",\
                                        "patinet_idnumber:str","describe:str"\
                                        "file_name:str")
    def add_or_edit_analyze(self,action):
        current_user_id=self.current_user.id
        patinet_idnumber=self.args["patinet_idnumber"]
        patient_name=self.args["patient_name"]
        describe=self.args["describe"]
        file_name=self.args["file_name"]
        session=self.session
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        if action=="add_analyze_request":
            analyze_record=AnalyzeRequestRecord(doctor_id=current_user_id)
        else:
            analyze_record=session.query(AnalyzeRequestRecord).filter_by(id=analyze_id).first()
        sex=int(patinet_idnumber[16])
        if sex%2:
            sex=1
        else:
            sex=2
        analyze_record.patient_name=patient_name
        analyze_record.patinet_idnumber=patinet_idnumber
        analyze_record.describe=describe
        analyze_record.patient_sex=sex
        analyze_record.file_name=file_name
        session.commit()
        return self.send_success()

    # 获取所有的操作记录
    @AdminBaseHandler.check_arguments("doctor_id?:int","status?:int","page:int")
    def get_analyze_list(self):
        session=self.session
        doctor_id=self.args.get("doctor_id",0)
        status=self.args.get("status",0)
        page=self.args.args["page"]
        page_num=10
        status_list=[]
        if not status:
            status_list=[0,1,2,3]
        else:
            status_list.append(status)
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        record_base=session.query(AnalyzeRequestRecord)\
                            .filter(AnalyzeRequestRecord.status.in_(status_list))
        if doctor_id:
            # 获取某个法医上传的数据
            all_records=record_base.filter_by(doctor_id=doctor_id)
        all_records=all_records.offset(page*page_num).limit(page_num).all()
        data_lis=[]
        for item in all_records:
            record_dict={
                "id":item.id,
                "doctor_id":item.doctor_id,
                "patient_name":item.patient_name,
                "patinet_idnumber":item.patinet_idnumber,
                "patient_sex_text":item.patient_sex_text,
                "describe":item.describe,
                "create_date":item.create_date.strftime("%Y-%m-%d %H:%M:%S")
            }
            data_list.append(record_dict)
        return self.send_success(data_list=data_list)
