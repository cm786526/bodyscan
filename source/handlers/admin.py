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

class StaffManage(AdminBaseHandler):
    """员工管理
    """
    @AdminBaseHandler.check_arguments("action:str","id?:int")
    def get(self):
        action=self.args["action"]
        account_id=self.args.get("id",0)
        session=self.session
        if not account_id:
            return self.send_fail("参数错误，缺少用户id")
        if action=="add_staff":
            account_info = self.get_account(account_id,action_type="id")
            shop_list,_=PubMethod.get_all_shops(session,self.current_user.id)
            shop_count=len(shop_list)
            return self.render("admin/add-staff.html",\
                                account_info=account_info,\
                                shop_list=shop_list,\
                                shop_count=shop_count,\
                                hire_link_dict={})
        elif action=="edit_staff":
            HireLink=models.HireLink
            Shop=models.Shop
            hire_links_base=session.query(HireLink).filter_by(staff_id=account_id)
            admin_hire_link=hire_links_base.filter_by(active_admin=1).all()
            recorder_hire_link=hire_links_base.filter_by(active_recorder=1).first()
            admin_shop_id_list=[x.shop_id for x in admin_hire_link]
            hire_link_one=hire_links_base.first()
            recorder_shop_id=0
            if recorder_hire_link:
                recorder_shop_id=recorder_hire_link.shop_id
            max_staff=session.query(func.max(HireLink.active_admin),\
                                    func.max(HireLink.active_recorder))\
                             .filter_by(staff_id=account_id)\
                             .first()
            hire_link_dict={
               "active_admin":max_staff[0],
               "active_recorder":max_staff[1],
               "admin_permission":hire_link_one.admin_permission,
               "admin_shop_id_list":admin_shop_id_list,
               "recorder_shop_id":recorder_shop_id,
               "remarks":hire_link_one.remarks
            }
            account_info = self.get_account(account_id,action_type="id")
            shop_list,_=PubMethod.get_all_shops(session,self.current_user.id)
            shop_count=len(shop_list)
            return self.render("admin/add-staff.html",\
                                account_info=account_info,\
                                shop_list=shop_list,\
                                shop_count=shop_count,\
                                hire_link_dict=hire_link_dict)
        else:
            return self.render("admin/home.html")

    @AdminBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="get_user":
            return self.get_user()
        elif action=="add_staff":
            return self.add_or_edit_staff()
        elif action=="edit_staff":
            return self.add_or_edit_staff()
        elif action=="get_all_staff":
            return self.get_all_staff()
        else:
            return self.send_error(404)

    @AdminBaseHandler.check_arguments("phone_or_id:str")
    def get_user(self):
        """根据手机号和id查询用户
        """
        phone_or_id = self.args["phone_or_id"]
        account_info = self.get_account(phone_or_id,action_type="phone")
        session = self.session
        if not account_info:
            account_info = self.get_account(phone_or_id,action_type="id")
            if not account_info:
                return self.send_fail("该用户还没有注册，不能添加为员工")

        #判断当前用户是否已经是员工
        hire_link = session.query(models.HireLink)\
                            .filter_by(staff_id=account_info["id"])\
                            .first()
        if hire_link:
            return self.send_fail("该用户已经是员工，不能重复添加")
        return self.send_success(account_info=account_info)


    def get_account(self,data,action_type="phone"):
        """根据手机号/id获取 accountinfo
        """
        session = self.session
        if action_type == "phone":
            account =session.query(models.Accountinfo)\
                            .filter_by(phone=data)\
                            .first()
        else:
            account =session.query(models.Accountinfo)\
                            .filter_by(id=data)\
                            .first()
        if account:
            account_info = {
                "id":account.id,
                "nickname":account.nickname or "",
                "realname":account.realname or "",
                "imgurl":models.AddImgDomain.add_domain_headimgsmall(account.headimgurl),
                "phone":account.phone or ""
            }
        else:
            account_info = {}
        return account_info

    @AdminBaseHandler.check_arguments("staff_id:int","admin_shop_id_list:str","admin_permission:str",\
                                        "recorder_shop_id:int","active_admin:int","active_recorder:int","remarks?:str")
    def add_or_edit_staff(self):
        """添加或者编辑员工
        """
        staff_id=self.args["staff_id"]
        admin_shop_id_list=eval(self.args["admin_shop_id_list"])
        recorder_shop_id=self.args["recorder_shop_id"]
        admin_permission=self.args["admin_permission"]
        active_admin=self.args["active_admin"]
        active_recorder=self.args["active_recorder"]
        remarks=self.args.get("remarks","")
        session=self.session
        account_info = self.get_account(staff_id,action_type="id")
        if not account_info:
            return self.send_fail("该用户还未在森果平台注册")

        #检查用户是否已经是员工，是则表示这次是编辑信息，否则任务是添加员工
        HireLink=models.HireLink
        hire_links = session.query(HireLink).filter_by(staff_id=staff_id)
        admin_shop=session.query(HireLink.shop_id)\
                            .filter_by(staff_id=self.current_user.id).distinct()\
                            .all()
        admin_shop_ids=[]
        for x in admin_shop:
            admin_shop_ids.append(x.shop_id)
        #　首先处理管理员
        if active_admin:
            for shop_id in admin_shop_id_list:
                each_hire_link=hire_links.filter_by(shop_id=shop_id).first()
                # 如果存在　则表示是编辑这条记录，如果没有，则表示是添加
                if not each_hire_link:
                    each_hire_link=HireLink(staff_id=staff_id,shop_id=shop_id)
                    session.add(each_hire_link)
                    session.flush()
                each_hire_link.active_admin=active_admin
            session.flush()
            old_all_shop=session.query(HireLink).filter_by(staff_id=staff_id)\
                                                .filter(HireLink.shop_id.in_(admin_shop_ids))\
                                                .all()
            for each_old in old_all_shop:
                if each_old.shop_id not in admin_shop_id_list:
                    each_old.active_admin=0
            session.flush()

        # active_admin =0 表示将该用户以前存在的所有管理员的active_admin字段置为０
        else:
            staff_hire_link=session.query(HireLink)\
                                    .filter_by(staff_id=staff_id)\
                                    .filter(HireLink.shop_id.in_(admin_shop_ids))\
                                    .all()
            for each_hire_link in staff_hire_link:
                each_hire_link.active_admin=0
            session.flush()
        # 然后处理录入员
        if active_recorder:
            # 由于编辑的单一性　，这里需要判断之前是录入员的门店id是否为当前的recorder_shop_id
            old_hire_recorder=session.query(HireLink)\
                                     .filter_by(staff_id=staff_id,active_recorder=1)\
                                     .filter(HireLink.shop_id.in_(admin_shop_ids))\
                                     .all()
            for each_hire_recorder in old_hire_recorder:
                if each_hire_recorder.shop_id != recorder_shop_id:
                    each_hire_recorder.active_recorder=0
                    session.flush()
            hire_link_recorder = hire_links.filter_by(shop_id=recorder_shop_id).first()
            if not hire_link_recorder:
                hire_link_recorder = HireLink(staff_id = staff_id,shop_id=recorder_shop_id)
                session.add(hire_link_recorder)
                session.flush()
            hire_link_recorder.active_recorder = active_recorder
            session.flush()
        else:
            staff_hire_link=session.query(HireLink)\
                                    .filter_by(staff_id=staff_id)\
                                    .filter(HireLink.shop_id.in_(admin_shop_ids))\
                                    .all()
            for each_hire_link in staff_hire_link:
                each_hire_link.active_admin=0
            session.flush()
        # 更新备注,所有hirelink备注都是相同的
        hire_links = session.query(HireLink).filter_by(staff_id=staff_id).all()
        for each_hire_link in hire_links:
            each_hire_link.remarks=remarks
            each_hire_link.admin_permission = admin_permission
        session.commit()
        return self.send_success()

    def get_all_staff(self):
        """获取员工列表,注意只能获取到当前管理员所管理的所有员工的信息
        """
        session=self.session
        HireLink=models.HireLink
        Accountinfo=models.Accountinfo
        current_hire_links=session.query(HireLink)\
                                    .filter_by(staff_id=self.current_user.id,\
                                                active_admin=1)\
                                    .all()
        admin_shop_id_list=[]
        for each_hire_link in current_hire_links:
            admin_shop_id_list.append(each_hire_link.shop_id)
        all_staffs=session.query(HireLink.id,HireLink.staff_id,\
                                func.max(HireLink.active_admin),\
                                func.max(HireLink.active_recorder),\
                                func.max(HireLink.remarks))\
                          .filter(HireLink.shop_id.in_(admin_shop_id_list))\
                          .group_by(HireLink.staff_id)\
                          .all()
        staff_ids=[]
        staff_hire_link_dict={}
        for hire_link_id,staff_id,active_admin,active_recorder,remarks in all_staffs:
            staff_ids.append(staff_id)
            staff_hire_link_dict[staff_id]={
                "hire_link_id":hire_link_id,
                "active_admin":active_admin,
                "active_recorder":active_recorder,
                "remarks":remarks
            }
        all_accounts = session.query(Accountinfo)\
                                .filter(Accountinfo.id.in_(staff_ids))\
                                .all()
        data_list=[]
        for account_info in all_accounts:
            each_hire_link=staff_hire_link_dict[account_info.id]
            staff_dict={
                "id":each_hire_link["hire_link_id"],
                "staff_id":account_info.id,
                "phone":account_info.phone,
                "realname":account_info.realname,
                "active_admin":each_hire_link["active_admin"],
                "active_recorder":each_hire_link["active_recorder"],
                "headimgurl":account_info.headimgurl,
                "remarks":each_hire_link["remarks"]
            }
            data_list.append(staff_dict)
        return self.send_success(data_list=data_list)