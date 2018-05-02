from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_
import dal.models as models
from handlers.base.pub_web import OperatorBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float
from settings import XINZHI_KEY
import requests, json ,datetime
from handlers.common import UpdateWebSocket


class Home(OperatorBaseHandler):
    def get(self):
        return self.render("operator/HomePage.html")

    @OperatorBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        if action in ["add_handler","edit_handler"]:
            return self.add_or_edit_analyze(action)
        elif action=="get_handler_list":
            return self.get_handler_list()
        else:
            return self.send_fail(403)

    # 操作员添加检测记录　对应操作员认领任务,编辑任务状态等
    @OperatorBaseHandler.check_arguments("handler_id?:int","analyze_id:int","status?:int")
    def add_or_edit_analyze(self,action):
        current_user_id=self.current_user.id
        session=self.session
        analyze_id=self.args["analyze_id"]
        OperatorHandlerRecord=models.OperatorHandlerRecord
        if action=="add_handler":
            analyze_record=OperatorHandlerRecord(analyze_id=analyze_id,\
                                                operator_id=current_user_id)
        else:
            handler_id=self.args.get("handler_id")
            status=self.args.get("status",0)
            analyze_record=session.query(OperatorHandlerRecord).filter_by(id=handler_id).first()
            analyze_record.status=status
        session.commit()
        return self.send_success()

    # 获取所有的操作记录
    @OperatorBaseHandler.check_arguments("operator_id?:int","status?:int","page:int")
    def get_handler_list(self):
        session=self.session
        operator_id=self.args.get("operator_id",0)
        status=self.args.get("status",0)
        page=self.args["page"]
        page_num=10
        status_list=[]
        if not status:
            status_list=[0,1,2,3]
        else:
            status_list.append(status)
        OperatorHandlerRecord=models.OperatorHandlerRecord
        AnalyzeRequestRecord=models.AnalyzeRequestRecord
        record_base=session.query(OperatorHandlerRecord,AnalyzeRequestRecord)\
                            .join(AnalyzeRequestRecord,OperatorHandlerRecord.analyze_id==AnalyzeRequestRecord.id)\
                            .filter(OperatorHandlerRecord.status.in_(status_list))
        if operator_id:
            # 获取某个法医上传的数据
            all_records=record_base.filter_by(operator_id=operator_id)
        else:
            all_records=record_base
        all_records=all_records.offset(page*page_num).limit(page_num).all()
        data_list=[]
        for handler,analyze in all_records:
            record_dict={
                "id":handler.id,
                "doctor_id":analyze.doctor_id,
                "patient_name":analyze.patient_name,
                "patinet_idnumber":analyze.patinet_idnumber,
                "patient_sex_text":analyze.patient_sex_text,
                "describe":analyze.describe,
                "create_date":analyze.create_date.strftime("%Y-%m-%d %H:%M:%S"),
                "get_date":handler.get_date.strftime("%Y-%m-%d %H:%M:%S"),
                "handler_date":handler.create_date.strftime("%Y-%m-%d %H:%M:%S"),
                "admin_affiliation":""
            }
            data_list.append(record_dict)
        return self.send_success(data_list=data_list)
