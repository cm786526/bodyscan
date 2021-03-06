import tornado.web
import os,sys
from sqlalchemy import or_, func,and_
import datetime
from dal.db_configs import redis
from handlers.base.pub_web import _AccountBaseHandler,GlobalBaseHandler
from handlers.base.pub_func import TimeFunc,NumFunc
import dal.models as models
from tornado.websocket import WebSocketHandler
import urllib
import logging
import json


class LoginVerifyCode(_AccountBaseHandler):
    """未登录用户获取短信验证码，用于注册或登录"""
    def prepare(self):
        """屏蔽登录保护"""
        pass

    @_AccountBaseHandler.check_arguments("action:str", "phone:str")
    def post(self):
        action = self.args["action"]
        phone = self.args["phone"]
        if len(phone) != 11:
            return self.send_fail("请填写正确的手机号")
        if action not in models.VerifyCodeUse.login_verify_code_use:
            if action not in models.VerifyCodeUse.operation_verify_code_use:
                return self.send_fail("invalid action")
        # 发送验证码
        result = gen_msg_token(phone, action)
        if result is True:
            return self.send_success()
        else:
            return self.send_fail(result)


class Profile(_AccountBaseHandler):
    """个人中心
    """
    @tornado.web.authenticated
    def prepare(self):
        """
            所有用户都必须要有手机号,没有手机号需重定向至手机号绑定页面
        """
        # if not self.current_user.phone:
        #     return self.redirect(self.reverse_url("PhoneBind"))

    def get(self):
        #获取个人信息
        data_dict=self.get_profile_info()
         # 判断用户角色
        userRole=self.session.query(func.min(models.UserRole.role)).filter_by(user_id=data_dict["id"])\
                                                .first()
        role=3
        if userRole:
            role=userRole[0]
        return self.render("common/profile.html",data_dict=data_dict,role=role)

    @_AccountBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        if action=="get_profile":
            return self.get_profile()
        elif action=="edit_profile":
            return self.edit_profile()
        elif action=="edit_headimg":
            return self.edit_headimg()
        elif action=="set_password":
            return self.set_password()
        elif action=="modify_password":
            return self.set_password()
        elif action=="modify_phone":
            return self.modify_phone()
        elif action=="change_role":
            return self.change_role()
        else:
            return self.send_fail(404)

    def get_profile_info(self):
        """ 获取个人信息
        """
        session=self.session
        current_user_id=self.current_user.id
        AccountInfo=models.Accountinfo
        account_info=session.query(AccountInfo)\
                            .filter_by(id=current_user_id)\
                            .first()
        account_dict={
            "id":account_info.id,
            "sex":account_info.sex,
            "phone":account_info.phone,
            "realname":account_info.nickname,
            "headimgurl":account_info.headimgurl,
            "sex_text":account_info.sex_text
        }
        return account_dict

    def get_profile(self):
        """ 获取个人信息
        """
        session=self.session
        current_user_id=self.current_user.id
        AccountInfo=models.Accountinfo
        account_info=session.query(AccountInfo)\
                            .filter_by(id=current_user_id)\
                            .first()
        account_dict={
            "id":account_info.id,
            "phone":account_info.phone,
            "realname":account_info.realname,
            "headimgurl":account_info.headimgurl,
            "sex_text":account_info.sex_text,
            "qq_number":account_info.qq_number,
            "wx_number":account_info.wx_number,
            "organization":account_info.organization,
            "signature":account_info.signature,
            "email":account_info.email,
            "id_number":account_info.id_number
        }
        return self.send_success(data_dict=account_dict)

    @_AccountBaseHandler.check_arguments("phone:str","realname:str","headimgurl:str","qq_number:str",\
                                        "wx_number:str","organization:str","signature:str","email:str","id_number:str")
    def edit_profile(self):
        phone=self.args["phone"]
        realname=self.args["realname"]
        headimgurl=self.args["headimgurl"]
        qq_number=self.args["qq_number"]
        wx_number=self.args["wx_number"]
        organization=self.args["organization"]
        signature=self.args["signature"]
        email=self.args["email"]
        id_number=self.args["id_number"]
        current_user_id=self.current_user.id
        session=self.session
        account_info=session.query(models.Accountinfo).filter_by(id=current_user_id).with_lockmode('update').first()
        account_info.phone=phone
        account_info.realname=realname
        account_info.headimgurl=headimgurl
        account_info.qq_number=qq_number
        account_info.wx_number=wx_number
        account_info.organization=organization
        account_info.signature=signature
        account_info.email=email
        account_info.id_number=id_number
        session.commit()
        return self.send_success()

    @_AccountBaseHandler.check_arguments("headimgurl:str")
    def edit_headimg(self):
        headimgurl=self.args["headimgurl"]
        current_user_id=self.current_user.id
        session=self.session
        account_info=session.query(models.Accountinfo).filter_by(id=current_user_id).with_lockmode('update').first()
        account_info.headimgurl=headimgurl
        session.commit()
        return self.send_success()

    @_AccountBaseHandler.check_arguments("password:str")
    def set_password(self):
        """ 设置密码
        """
        password=self.args["password"]
        password=SimpleEncrypt.encrypt(password)
        session=self.session
        current_user_id=self.current_user.id
        AccountInfo=models.Accountinfo
        account_info=session.query(AccountInfo)\
                            .filter_by(id=current_user_id)\
                            .first()
        account_info.password=password
        session.commit()
        return self.send_success()

    @_AccountBaseHandler.check_arguments("phone:str","code:str")
    def modify_phone(self):
        """ 修改手机号
        """
        phone=self.args["phone"]
        code=self.args["code"]
        session=self.session
        current_user_id=self.current_user.id
        AccountInfo=models.Accountinfo
        check_msg_res = check_msg_token(phone, code, use="bind")
        if not check_msg_res:
            return self.send_fail("验证码过期或者不正确")
        account_info=session.query(AccountInfo)\
                            .filter_by(id=current_user_id)\
                            .first()
        account_info.phone=phone
        session.commit()
        return self.send_success()

    @_AccountBaseHandler.check_arguments("target:str")
    def change_role(self):
        """切换角色
        """
        target=self.args["target"]
        # 判断用户是否可以切换
        current_user_id=self.current_user.id
        session=self.session
        HireLink=models.HireLink
        max_staff=session.query(func.max(HireLink.active_admin),\
                                func.max(HireLink.active_recorder))\
                        .filter_by(staff_id=current_user_id)\
                        .first()
        if target=="admin":
            if max_staff[0]:
                return self.send_success(next_url=self.reverse_url("shopmanage"))
            else:
                return self.send_fail("您不是管理员，不能切换到管理端")
        elif target=="recorder":
            if max_staff[1]:
                return self.send_success(next_url=self.reverse_url("recordergoodsmanage"))
            else:
                return self.send_fail("您不是录入员，不能切换到录入端")
        else:
            return self.send_fail(404)

class UpdateWebSocket(WebSocketHandler,_AccountBaseHandler):
    """websocket代替轮询获取更新的数据
    """
    # 保存连接的管理员，用于后续推送消息
    all_shop_admins = {}
    all_shop_recorders= {}
    def open(self):
        # print("new　client opened")
        # 根据cookie判断用户当前在管理端还是录入端
        user_type = self.get_cookie('user_type')
        HireLink=models.HireLink
        current_user_id=self.current_user.id
        all_shop_admins=UpdateWebSocket.all_shop_admins
        all_shop_recorders=UpdateWebSocket.all_shop_recorders
        session=self.session
        if user_type=="admin":
            # 判断连接的管理员所在店铺id
            all_shops=session.query(HireLink.shop_id)\
                                .filter_by(staff_id=current_user_id,\
                                            active_admin=1)\
                                .all()
            for each_shop in all_shops:
                _id=str(each_shop[0])
                if _id in all_shop_admins:
                    all_shop_admins[_id].append(self)
                else:
                    all_shop_admins[_id]=[self]
        elif user_type=="recorder":
            # 判断连接的录入员所在的店铺id
            all_shops=session.query(HireLink.shop_id)\
                                .filter_by(staff_id=current_user_id,\
                                            active_recorder=1)\
                                .all()
            for each_shop in all_shops:
                _id=str(each_shop[0])
                if _id in all_shop_recorders:
                    all_shop_recorders[_id].append(self)
                else:
                    all_shop_recorders[_id]=[self]

    def on_close(self):
        # print("one client closed")
        for value in UpdateWebSocket.all_shop_admins.values():
            if self in value:
                value.remove(self)

    # 录入员录入完成之后发送消息告诉管理员
    @classmethod
    def send_demand_updates(cls,message):
        logging.info("sending message to %d admins", len(cls.all_shop_admins))
        all_admins=[]
        shop_id=str(message["shop_id"])
        if shop_id in UpdateWebSocket.all_shop_admins:
            all_admins=UpdateWebSocket.all_shop_admins[shop_id]
        for _admin in all_admins:
            try:
                _admin.write_message(message)
            except:
                logging.error("Error sending message", exc_info=True)

    # 管理员修改预订系数之后告诉录入员
    @classmethod
    def send_ratio_updates(cls,message):
        logging.info("sending message to %d recorders", len(cls.all_shop_recorders))
        all_recorders=[]
        shop_id=str(message["shop_id"])
        if shop_id in UpdateWebSocket.all_shop_recorders:
            all_recorders=UpdateWebSocket.all_shop_recorders[shop_id]
        for _recorder in all_recorders:
            try:
                _recorder.write_message(message)
            except:
                logging.error("Error sending message", exc_info=True)

    def on_message(self,message):
        # 接收客户端发来的消息
        logging.info("got message %r", message)

    def check_origin(self, origin):
        parsed_origin = urllib.parse.urlparse(origin)
        return parsed_origin.netloc.index(".senguo.cc")!=-1

class FileUploadHandler(GlobalBaseHandler):
    def get(self):
        return self.render("recorder/upload-file.html")

    @GlobalBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        # 获取上级目录
        path_base=os.path.join(os.path.dirname(__file__),"../utils/uploadfiles/")
        temp_path=os.path.join(path_base,"temp_files/")
        if action=="chunk_upload":
            return self.chunk_upload(path_base,temp_path)
        elif action=="merge_file":
            return self.merge_file(path_base,temp_path)
        elif action=="upload_img":
            return self.upload_img()
        elif action=="upload_pdf":
            return self.upload_pdf()
        else:
            return self.send_fail(403)

    def upload_img(self):
        file_metas = self.request.files.get('file', None)  # 提取表单中‘name’为‘file’的文件元数据
        if not file_metas:
            return  self.send_fail("缺少图片文件")
        # 获取上级目录
        path_base=os.path.join(os.path.dirname(__file__),"../static/images/headimg/")
        for meta in file_metas:
            # 实际上只运行一次 只有一个文件
            filename =meta["filename"]
            file_path = path_base+filename
            # 判断文件是否存在
            if os.path.exists(file_path):
                return self.send_fail("文件已经上传，请勿重复操作")
            with  open(file_path, 'wb') as new_file:
                new_file.write(meta['body'])
        return self.send_success()

    def upload_pdf(self):
        file_metas = self.request.files.get('file', None)  # 提取表单中‘name’为‘file’的文件元数据
        if not file_metas:
            return  self.send_fail("缺少图片文件")
        # 获取上级目录
        path_base=os.path.join(os.path.dirname(__file__),"../utils/uploadfiles/uploadpdf/")
        for meta in file_metas:
            # 实际上只运行一次 只有一个文件
            filename =meta["filename"]
            file_path = path_base+filename
            print(file_path)
            # 判断文件是否存在
            if os.path.exists(file_path):
                return self.send_fail("文件已经上传，请勿重复操作")
            with  open(file_path, 'wb') as new_file:
                new_file.write(meta['body'])
        return self.send_success()


    def chunk_upload(self,path_base,temp_path):
        # 分片上传 暂时存入临时文件夹中
        file_metas = self.request.files.get('file', None)  # 提取表单中‘name’为‘file’的文件元数据
        chunk_num = self.request.body_arguments["index"][0].decode('utf-8')
        if not file_metas:
            return  self.send_fail("缺少文件")
        # 判断文件夹是否存在，没有则创建
        if not os.path.exists(temp_path):
            os.makedirs(temp_path)
        for meta in file_metas:
            # 实际上只运行一次 只有一个文件
            filename =meta["filename"]
            file_path = temp_path+filename+'.part'+str(chunk_num)
            # 判断文件是否存在
            if os.path.exists(file_path):
                return self.send_fail("文件已经上传，请勿重复操作")
            with  open(file_path, 'wb') as new_file:
                new_file.write(meta['body'])
        return self.send_success()


    @GlobalBaseHandler.check_arguments("file_name:str","total_chunk:int")
    def merge_file(self,path_base,temp_path):
        # 上传完成之后合并文件
        file_name=self.args["file_name"]
        total_chunk=self.args["total_chunk"]
        chunk_files=[]
        file_path=path_base+file_name
        try:
            with open(file_path, 'wb') as new_file:
                for i in range(total_chunk):
                    one_file=temp_path+file_name+'.part'+str(i)
                    with open(one_file,'rb') as chunk_one:
                        new_file.write(chunk_one.read())
                    chunk_files.append(one_file)
            # 删除碎片文件
            for _file in chunk_files:
                os.remove(_file)
            return self.send_success()
        except:
            return self.send_fail("合并文件失败，请联系管理员")



class FileDownloadHandler(GlobalBaseHandler):
    @GlobalBaseHandler.check_arguments("filename:str","action:str")
    def get(self):
        filename=self.args["filename"]
        action=self.args["action"]
        if not filename:
            return self.write("文件不存在，请联系法医或者技术人员")
        if action=="get_feedback_pdf":
            path_base=os.path.join(os.path.dirname(__file__),"../utils/uploadfiles/uploadpdf/")
        elif action=="get_upload_file":
            path_base=os.path.join(os.path.dirname(__file__),"../utils/uploadfiles/")
        file_path = path_base + filename
        # 判断文件是否存在
        if not os.path.exists(file_path):
            return self.write("文件不存在，请联系法医或者技术人员")
        self.set_header ('Content-Type', 'application/octet-stream')
        self.set_header ('Content-Disposition', 'attachment; filename='+filename)
        # 流式读取
        with open(file_path, 'rb') as target_file:
            while True:
                chunk = target_file.read(10 * 1024 * 1024)  # 每次读取10M
                if not chunk:
                    break
                self.write(chunk)
        #记得有finish哦
        return self.finish()

class AccountManage(_AccountBaseHandler):
    @_AccountBaseHandler.check_arguments("action?:str")
    def get(self):
        pass

    def post(self):
        action=self.args["action"]
