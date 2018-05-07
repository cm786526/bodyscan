from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_, func
import dal.models as models
from handlers.base.pub_web import AdminBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float, PubMethod
import requests, json , datetime

@AdminBaseHandler.check_arguments("action?:str")
class Home(AdminBaseHandler):
    def get(self):
    	action=self.args.get("action","")
    	if action=="manage_data":
        	return self.render("super/DataManager.html")
        elif action=="manage_admin":
        	return self.render("super/AdminManager.html")
        else action=="manage_operator":
        	return self.render("super/OperatorManager.html")
        else:
        	return self.send_fail(403)