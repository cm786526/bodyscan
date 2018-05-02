from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_, func
import dal.models as models
from handlers.base.pub_web import AdminBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float, PubMethod
import requests, json , datetime
from handlers.celery_autowork_task import send_email
from handlers.common import UpdateWebSocket

class Home(AdminBaseHandler):
    @AdminBaseHandler.check_arguments("action?:str")
    def get(self):
        action=self.args.get("action","")
        if action=="add_record":
            return self.render("admin/add_record.html")
        elif action=="edit_record":
            data_dict=self.get_record_info_one()
            return self.render("admin/edit_record.html",data_dict=data_dict)
        else:
            return self.render("admin/HomePage.html")

    @AdminBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        if action in ["add_analyze_request","edit_analyze_request"]:
            return self.add_or_edit_analyze(action)
        elif action=="get_analyze_list":
            return self.get_analyze_list()
        else:
            return self.send_fail(403)

    # 获取一条记录的信息
    @AdminBaseHandler.check_arguments("record_id:int")
    def get_record_info_one(self):
        record_id=self.args["record_id"]
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        session=self.session
        analyze_record=session.query(AnalyzeRequestRecord).filter_by(id=record_id).first()
        data_dict={
            "id":analyze_record.id,
            "patient_name":analyze_record.patient_name,
            "patient_idnumber":analyze_record.patient_idnumber,
            "describe":analyze_record.describe,
            "sex":analyze_record.patient_sex,
            "file_name":analyze_record.file_name,
            "measuring_position":analyze_record.measuring_position,
            "measuring_method":analyze_record.measuring_method,
            "measuring_date":analyze_record.measuring_date
        }
        return data_dict


    # 法医添加或者编辑记录
    @AdminBaseHandler.check_arguments("analyze_id?:int","patient_name:str",\
                                        "patient_idnumber:str","describe:str",\
                                        "file_name:str","measuring_position:str",\
                                        "measuring_method:str","measuring_date:str")
    def add_or_edit_analyze(self,action):
        current_user_id=self.current_user.id
        patient_idnumber=self.args["patient_idnumber"]
        patient_name=self.args["patient_name"]
        describe=self.args["describe"]
        file_name=self.args["file_name"]
        measuring_position=self.args["measuring_position"]
        measuring_method=self.args["measuring_method"]
        measuring_date=self.args["measuring_date"]
        session=self.session
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        if action=="add_analyze_request":
            analyze_record=AnalyzeRequestRecord(doctor_id=current_user_id)
            session.add(analyze_record)
        else:
            analyze_record=session.query(AnalyzeRequestRecord).filter_by(id=analyze_id).first()
        sex=3
        # sex=int(patient_idnumber[16])
        if sex%2:
            sex=1
        else:
            sex=2
        analyze_record.patient_name=patient_name
        analyze_record.patient_idnumber=patient_idnumber
        analyze_record.describe=describe
        analyze_record.patient_sex=sex
        analyze_record.file_name=file_name
        analyze_record.measuring_position=measuring_position
        analyze_record.measuring_method=measuring_method
        # analyze_record.measuring_date=measuring_date
        session.commit()
        return self.send_success()

    # 获取所有的操作记录
    @AdminBaseHandler.check_arguments("doctor_id?:int","status?:int","page:int")
    def get_analyze_list(self):
        session=self.session
        doctor_id=self.args.get("doctor_id",0)
        status=self.args.get("status",0)
        page=self.args["page"]
        page_num=10
        status_list=[]
        if status==-1:
            status_list=[0,1,2,3]
        else:
            status_list.append(status)
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        record_base=session.query(AnalyzeRequestRecord)\
                            .filter(AnalyzeRequestRecord.status.in_(status_list))
        if doctor_id:
            # 获取某个法医上传的数据
            all_records=record_base.filter_by(doctor_id=doctor_id)
        else:
            all_records=record_base
        all_records=all_records.offset(page*page_num).limit(page_num).all()
        data_list=[]
        for item in all_records:
            record_dict={
                "id":item.id,
                "doctor_id":item.doctor_id,
                "patient_name":item.patient_name,
                "patinet_idnumber":item.patient_idnumber,
                "patient_sex_text":item.patient_sex_text,
                "describe":item.describe,
                "create_date":item.create_date.strftime("%Y-%m-%d %H:%M:%S"),
                "status":item.status
            }
            data_list.append(record_dict)
        return self.send_success(data_list=data_list)
