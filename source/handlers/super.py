from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_, func
import dal.models as models
from handlers.base.pub_web import AdminBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float, PubMethod
import requests, json , datetime

class Home(AdminBaseHandler):
    def get(self):
        return self.render("admin/index.html")