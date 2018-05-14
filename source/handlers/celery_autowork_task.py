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

def send_email(email_receivers,email_subject,email_body):
    """ 发送邮件
    """

    smtpserver = SMTP_SERVER
    password = EMAIL_PASSWORD
    sender = EMAIL_SENDER
    receivers = ','.join(email_receivers)

    # 如名字所示： Multipart就是多个部分
    msg = MIMEMultipart()
    msg['Subject'] = email_subject
    msg['From'] = sender
    msg['To'] = receivers

    # 下面是文字部分，也就是纯文本
    puretext = MIMEText(email_body)
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