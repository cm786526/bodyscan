import os,sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"../")))
import requests
import datetime,time
from sqlalchemy import or_, func, and_, not_
import json
from celery import Celery
from celery.schedules import crontab
from celery import group
import dal.models as models
from dal.db_configs import (engine,DBSession,redis,statistic_DBSession)
from sqlalchemy.orm import (sessionmaker,scoped_session)
from handlers.base.pub_func import TimeFunc,NumFunc
from settings import (CELERY_BROKER,XINZHI_KEY,SMTP_SERVER,EMAIL_PASSWORD,\
    EMAIL_SENDER,EMAIL_RECEIVERS,EMAIL_SUBJECT,EMAIL_BODY)
import xlwt
from xlwt import *
from xlrd import open_workbook
from xlutils.copy import copy
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.header import Header
import smtplib

AutoWork = Celery('auto_work', broker = CELERY_BROKER, backend = '')
AutoWork.conf.CELERY_TIMEZONE              = 'Asia/Shanghai'  # 时区
AutoWork.conf.CELERYD_CONCURRENCY          = 4                # 任务并发数
AutoWork.conf.CELERYD_TASK_SOFT_TIME_LIMIT = 300              # 任务超时时间
AutoWork.conf.CELERY_DISABLE_RATE_LIMITS   = True             # 任务频率限制开关

AutoWork.conf.CELERYBEAT_SCHEDULE = {
    'update_current_weather':{
        'task':'update_current_weather',
        'schedule':crontab(minute=0,hour=0),
        'options':{"queue":"auto_work"}
    },
    'export_statistic_data_only':{
        'task':'export_statistic_data_only',
        'schedule':crontab(minute=50,hour=23),
        'options':{"queue":"auto_work"}
    }
}

AutoWork.conf.CELERY_ROUTES = {                               # 任务调度队列
    "auto_work.export_statistic_data_and_mail": {"queue": "auto_work"},
}
scoped_DBSession = scoped_session(sessionmaker(autocommit=False, autoflush=False))
session=DBSession()
statistic_session=statistic_DBSession()

# @worker_init.connect
def initialize_session(signal,sender):
    scoped_DBSession.configure(bind=engine)

@AutoWork.task(bind=True,name="update_current_weather")
def update_current_weather(self):
    """ 每天早上凌晨自动更新天气信息，保存到数据库
    """
    Shop=models.Shop
    HistoryWeatherRecord=models.HistoryWeatherRecord
    all_citys=scoped_DBSession.query(Shop.shop_city).distinct().all()
    all_citys_code=[]
    for city in all_citys:
        all_citys_code.append(city.shop_city)
    current_date=datetime.date.today()
    current_weekday=current_date.weekday()
    holiday="无"
    if str(current_date) in holiday_dict:
        holiday=holiday_dict[current_date]
    elif current_weekday in [5,6]:
        holiday="周末"
    city_list=area_dict["city_list"]
    country_list=area_dict["country_list"]
    failed_count=0

    # 遍历每个城市，并添加天气信息
    for city_code in all_citys_code:
        city_name=""
        str_city_code=str(city_code)
        if str_city_code in city_list:
            city_name=city_list[str_city_code]
        elif str_city_code in country_list:
            city_name=country_list[str_city_code]
        # 请求天气数据
        result=requests.get('https://api.seniverse.com/v3/weather/daily.json?key='+\
                            XINZHI_KEY+'&location='+city_name+'&language=zh-Hans&unit=c&start=0&days=１')
        if result.status_code != 200:
            failed_count+=1
            continue
        result=json.loads(result.content.decode("utf-8"))
        result=result["results"][0]["daily"][0]
        new_weather = HistoryWeatherRecord(city_code=city_code,\
                                           city_name=city_name,\
                                           create_date=current_date,\
                                           low_temperature=result["low"],\
                                           high_temperature=result["high"],\
                                           weather=result["text_day"],\
                                           week_day=current_weekday,\
                                           holiday=holiday)
        scoped_DBSession.add(new_weather)
    scoped_DBSession.commit()
    print("共计%d个城市或者区域的天气信息没有找到"%failed_count)
    return True


def send_email(email_receivers):
    """ 发送邮件
    """

    smtpserver = SMTP_SERVER
    password = EMAIL_PASSWORD
    sender = EMAIL_SENDER
    receivers = ','.join(email_receivers)

    # 如名字所示： Multipart就是多个部分
    msg = MIMEMultipart()
    msg['Subject'] = EMAIL_SUBJECT
    msg['From'] = sender
    msg['To'] = receivers

    # 下面是文字部分，也就是纯文本
    puretext = MIMEText(EMAIL_BODY)
    msg.attach(puretext)
    try:
        smtpObj = smtplib.SMTP_SSL()
        smtpObj.connect(smtpserver,465) # SMTP协议默认端口是25  但是如果是SSL 则是465 或者587
        smtpObj.login(sender,password)
        smtpObj.sendmail(sender,receivers,msg.as_string())
        smtpObj.quit()
        return True
    except smtplib.SMTPException as e:
        print(e.message)
        print("发送邮件失败")
        return False