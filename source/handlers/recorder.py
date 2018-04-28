from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_
import dal.models as models
from handlers.base.pub_web import RecordBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float
from settings import XINZHI_KEY
import requests, json ,datetime
from handlers.common import UpdateWebSocket

class GoodsManage(RecordBaseHandler):
    """商品管理
    """
    def get(self):
        return self.render("recorder/home.html")

    @RecordBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="get_all_goods":
            return self.get_all_goods_by_classify()
        elif action=="get_all_shops":
            return self.get_all_shops()
        else:
            return self.send_error(404)

    @RecordBaseHandler.check_arguments("classify:int")
    def get_all_goods_by_classify(self):
        """根据分类获取商品信息
        """
        session = self.session
        classify = self.args["classify"]
        if classify==3:
            #　表示获取水果和蔬菜
            classify_list=[1,2]
        else:
            classify_list=[classify]
        all_goods_list =[]
        Goods=models.Goods
        ShopGoods=models.ShopGoods
        HireLink=models.HireLink
        current_user_id=self.current_user.id
        hire_link =session.query(HireLink)\
                            .filter_by(staff_id=current_user_id,\
                                active_recorder=1)\
                            .first()
        all_goods= session.query(Goods,ShopGoods)\
                            .join(ShopGoods,Goods.id==ShopGoods.goods_id)\
                            .filter(ShopGoods.status!=-1,\
                                    ShopGoods.shop_id==hire_link.shop_id,\
                                    Goods.classify.in_(classify_list))\
                            .all()
        for each_element in all_goods:
            each_goods=each_element[0]
            each_shop_goods=each_element[1]
            each_goods_dict ={
                "shop_goods_id":each_shop_goods.id,
                "goods_id":each_goods.id,
                "goods_name":each_goods.goods_name,
                "goods_code":each_goods.goods_code,
                "unit":each_goods.unit_text,
                "reserve_ratio":each_shop_goods.reserve_ratio,
                "reserve_cycle":each_shop_goods.reserve_cycle,
                "discount":each_shop_goods.discount
            }
            all_goods_list.append(each_goods_dict)
        return self.send_success(all_goods=all_goods_list)

    def get_all_shops(self):
        """获取录入员所在的所有店铺(当前逻辑实际上一个录入员只属于一个店铺,接口按照多个店铺设计)
        """
        session = self.session
        Shop = models.Shop
        HireLink=models.HireLink
        current_user_id=self.current_user.id
        data_list=[]
        shoplist=[]
        hire_link =session.query(HireLink)\
                            .filter_by(staff_id=current_user_id,\
                                active_recorder=1)\
                            .all()
        for each_hire_link in hire_link:
            shoplist.append(each_hire_link.shop_id)
        all_shops = session.query(Shop)\
                            .filter(Shop.id.in_(shoplist))\
                            .all()
        for each_shop in all_shops:
            each_shop_dict ={
                "id":each_shop.id,
                "shop_name":each_shop.shop_name,
                "shop_trademark_url":each_shop.shop_trademark_url,
                "city_code":each_shop.shop_city
            }
            data_list.append(each_shop_dict)
        return self.send_success(data_list=data_list)


class Record(RecordBaseHandler):
    """记录
    """
    def get(self):
        return self.render("recorder/home.html")

    @RecordBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="get_demand_record_by_date":
            return self.get_demand_record_by_date()
        elif action=="get_weather_by_date":
            return self.get_weather_by_date()
        else:
            return self.send_error(404)

    @RecordBaseHandler.check_arguments("date:str")
    def get_demand_record_by_date(self):
        """ 按日期获取订货信息记录
        """
        date=self.args["date"]
        start_datetime = datetime.datetime.strptime(date, "%Y-%m-%d")
        end_datetime = start_datetime + datetime.timedelta(days=1)
        session = self.session
        Demand = models.Demand
        Accountinfo = models.Accountinfo
        Goods = models.Goods
        current_user=self.current_user
        all_demands=session.query(Demand,Accountinfo,Goods)\
                            .join(Accountinfo,Demand.opretor_id==Accountinfo.id)\
                            .join(Goods,Demand.goods_id==Goods.id)\
                            .filter(Demand.create_date>=start_datetime,\
                                    Demand.create_date<=end_datetime,\
                                    Demand.opretor_id==current_user.id)\
                            .order_by(Demand.create_date.desc())\
                            .all()
        data_list=[]
        for each_demand,account_info,goods in all_demands:
            each_goods_dict ={
                "id":each_demand.id,\
                "goods_id":each_demand.goods_id,\
                "goods_name":goods.goods_name,\
                "unit":goods.unit_text,\
                "order_amount":each_demand.order_amount,\
                "yesterday_wasted":each_demand.yesterday_wasted,\
                "create_date":str(each_demand.create_date).replace(each_demand.create_date.strftime('%Y-%m-%d'),""),\
                "yesterday_sale":each_demand.yesterday_sale,\
                "today_arrival":each_demand.today_arrival,\
                "today_purchase_price":each_demand.today_purchase_price/100,\
                "today_price":each_demand.today_price/100,\
                "current_stock":each_demand.current_stock,\
                "opretor_name":account_info.nickname
            }
            data_list.append(each_goods_dict)
        self.send_success(data_list=data_list)

    @RecordBaseHandler.check_arguments("date:str")
    def get_weather_by_date(self):
        """根据日期获取天气信息
        """
        date=self.args["date"]
        week_list={0:"周一",1:"周二",2:"周三",3:"周四",4:"周五",5:"周六",6:"周日"}
        # 获取昨天的天气数据
        HistoryWeatherRecord=models.HistoryWeatherRecord
        this_weather=self.session.query(HistoryWeatherRecord).filter_by(create_date=date).first()
        weather_dict={
            "weekday":week_list.get(datetime.datetime.strptime(date,"%Y-%m-%d").weekday(),"周一"),
            "low_temperature":0,
            "high_temperature":0,
            "weather":"无",
        }
        if this_weather:
            weather_dict["low_temperature"]=this_weather.low_temperature
            weather_dict["high_temperature"]=this_weather.high_temperature
            weather_dict["weather"]=this_weather.weather
        return self.send_success(weather_dict=weather_dict)


class Settings(RecordBaseHandler):
    """录入员相关设置
    """
    def get(self):
        return self.render("recorder/home.html")

    @RecordBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="set_order_ratio":
            return self.set_order_ratio()
        elif action=="get_order_ratio":
            return self.get_order_ratio()
        elif action=="get_order_ratio_new":
            return self.get_order_ratio_new()
        elif action=="get_weather":
            return self.get_weather()
        else:
            return self.send_error(404)

    def get_order_ratio(self):
        """获取预订量系数
        """
        staff_id=self.current_user.id
        recorder_sttings=self.session.query(models.RecordSettings)\
                                     .filter_by(staff_id=staff_id)\
                                     .first()
        settings_dict={
            "order_ratio":recorder_sttings.order_ratio
        }
        return self.send_success(settings_dict=settings_dict)

    @RecordBaseHandler.check_arguments("shop_id:int","goods_id:int")
    def get_order_ratio_new(self):
        """获取预订量系数
        """
        shop_id=self.args["shop_id"]
        goods_id=self.args["goods_id"]
        session=self.session
        ShopGoods=models.ShopGoods
        shop_goods=session.query(ShopGoods)\
                            .filter_by(shop_id=shop_id,goods_id=goods_id)\
                            .first()
        reserve_ratio=shop_goods.reserve_ratio or 1
        settings_dict={
            "reserve_ratio":reserve_ratio
        }
        return self.send_success(settings_dict=settings_dict)

    @RecordBaseHandler.check_arguments("order_ratio:float")
    def set_order_ratio(self):
        """设置预订量系数
        """
        staff_id=self.current_user.id
        order_ratio=self.args["order_ratio"]
        session=self.session
        recordr_sttings=session.query(models.RecordSettings)\
                                .filter_by(staff_id=staff_id)\
                                .first()
        if order_ratio<0:
            order_ratio=0
        recordr_sttings.order_ratio=order_ratio
        session.commit()
        return self.send_success()

    @RecordBaseHandler.check_arguments("city_code?:str")
    def get_weather(self):
        """获取昨天，今天，明天，后天的天气信息
        """
        city_code=self.args.get("city_code","420100")
        today=datetime.date.today()
        yesterday=today+datetime.timedelta(days=-1)
        week_list={0:"周一",1:"周二",2:"周三",3:"周四",4:"周五",5:"周六",6:"周日"}
        day_text=["昨天","今天","明天","后天"]
        data_list=[]

        # 获取昨天的天气数据
        HistoryWeatherRecord=models.HistoryWeatherRecord
        yesterday_weather=self.session.query(HistoryWeatherRecord).filter_by(create_date=yesterday).first()
        # 获取节日
        holiday="无"
        if str(yesterday) in holiday_dict:
            holiday=holiday_dict[yesterday]
        elif yesterday.weekday() in [5,6]:
            holiday="周末"
        weather_dict={
            "day_text":"昨天",
            "weekday":week_list.get(yesterday.weekday(),"周一"),
            "low_temperature":0,
            "high_temperature":0,
            "weather":"无",
            "holiday":holiday
        }
        if yesterday_weather:
            weather_dict["low_temperature"]=yesterday_weather.low_temperature
            weather_dict["high_temperature"]=yesterday_weather.high_temperature
            weather_dict["weather"]=yesterday_weather.weather
        data_list.append(weather_dict)

        # 请求今天，明天，后天的天气数据
        requests_url='https://api.seniverse.com/v3/weather/daily.json?key='+\
                        XINZHI_KEY+'&location='+city_code+'&language=zh-Hans&unit=c&start=0&days=3'
        result=requests.get(requests_url)
        if result.status_code== 200:
            result=json.loads(result.content.decode("utf-8"))
            all_weather=result["results"][0]["daily"]
            for each_weather in all_weather:
                current_date=each_weather["date"]
                current_weekday=datetime.datetime.strptime(current_date,"%Y-%m-%d").weekday()
                weekday=week_list.get(current_weekday,"周一")
                # 获取节日
                holiday="无"
                if str(current_date) in holiday_dict:
                    holiday=holiday_dict[current_date]
                elif current_weekday in [5,6]:
                    holiday="周末"
                weather_dict={
                    "day_text":day_text[all_weather.index(each_weather)+1],
                    "weekday":weekday,
                    "low_temperature":each_weather["low"],
                    "high_temperature":each_weather["high"],
                    "weather":each_weather["text_day"],
                    "holiday":holiday
                }
                data_list.append(weather_dict)
        else:
            return self.send_fail("获取天气信息失败")
        return self.send_success(data_list=data_list)


class EnteringGoods(RecordBaseHandler):
    """录入商品
    """
    @RecordBaseHandler.check_arguments("goods_code:int")
    def get(self):
        Goods=models.Goods
        goods_code=self.args["goods_code"]
        goods=self.session.query(Goods)\
                            .filter_by(goods_code=goods_code)\
                            .first()
        if not goods:
            return self.send_fail("该商品不存在")
        staff_id=self.current_user.id
        recordr_sttings=self.session.query(models.RecordSettings)\
                                    .filter_by(staff_id=staff_id)\
                                    .first()
        goods_info={
            "id":goods.id,
            "goods_name":goods.goods_name,
            "unit":goods.unit_text,
            "order_ratio":recordr_sttings.order_ratio
        }
        return self.render("recorder/entering-goods.html",goods_info=goods_info)

    @RecordBaseHandler.check_arguments("action:str")
    def post(self):
        action=self.args["action"]
        if action=="stock_in":
            return self.stock_in()
        elif action=="set_goods_discount":
            return self.set_goods_discount()
        else:
            return self.send_error(404)

    @RecordBaseHandler.check_arguments("goods_id:int","shop_id:int","order_amount:float","yesterday_wasted:float",\
                                        "yesterday_sale:float","today_arrival:float","today_purchase_price:float",\
                                        "today_price:float","current_stock:float")
    def stock_in(self):
        """ 添加要货单
        """
        session = self.session
        Demand=models.Demand
        goods_id = self.args["goods_id"]
        shop_id = self.args["shop_id"]
        order_amount = self.args["order_amount"]
        yesterday_wasted = self.args["yesterday_wasted"]
        yesterday_sale = self.args["yesterday_sale"]
        today_arrival = self.args["today_arrival"]
        today_purchase_price=self.args["today_purchase_price"]
        today_price = self.args["today_price"]
        current_stock = self.args["current_stock"]
        current_user_id = self.current_user.id
        if today_price:
            today_price = round(today_price*100)
        if today_purchase_price:
            today_purchase_price=round(today_purchase_price*100)
        Goods=models.Goods
        the_goods=session.query(Goods).filter_by(id=goods_id).first()
        # 查询该店铺该商品今天是否已经有提交记录
        today=datetime.date.today()
        exist_demand=session.query(Demand)\
                            .filter_by(goods_id=goods_id,\
                                        shop_id=shop_id,\
                                        current_date=today)\
                            .all()
        new_demand = Demand(goods_id=goods_id,\
                           shop_id=shop_id,\
                           order_amount=order_amount,\
                           yesterday_sale=yesterday_sale,\
                           yesterday_wasted=yesterday_wasted,\
                           today_arrival=today_arrival,\
                           today_purchase_price=today_purchase_price,\
                           today_price=today_price,\
                           current_stock=current_stock,\
                           opretor_id=current_user_id)
        session.add(new_demand)
        session.commit()
        # 判断是否需要websocket推送消息给管理端
        goods_add=True
        if exist_demand:
            goods_add=False
        update_dict={
            "shop_id":shop_id,
            "goods_id":goods_id,
            "classify":the_goods.classify,
            "goods_add":goods_add
        }
        UpdateWebSocket.send_demand_updates(update_dict)
        return self.send_success()

    @RecordBaseHandler.check_arguments("shop_goods_id:int","discount:int")
    def set_goods_discount(self):
        shop_goods_id=self.args["shop_goods_id"]
        discount=self.args["discount"]
        session=self.session
        ShopGoods=models.ShopGoods
        Shop=models.Shop
        Goods=models.Goods
        shop_goods,shop_region,classify=session.query(ShopGoods,Shop.shop_region,Goods.classify)\
                                                .filter_by(id=shop_goods_id)\
                                                .first()
        shop_goods.discount=discount
        # 如果是取消打折商品，则需要将预定系数恢复成普通系数
        if discount==0:
            normal_shop_goods=session.query(ShopGoods)\
                                        .join(Shop,ShopGoods.shop_id==Shop.id)\
                                        .join(Goods,ShopGoods.goods_id==Goods.id)\
                                        .filter(ShopGoods.discount==0,\
                                                Goods.classify==classify,\
                                                Shop.shop_region==shop_region)\
                                        .first()
            if normal_shop_goods:
                shop_goods.reserve_ratio=normal_shop_goods.reserve_ratio
            else:
                shop_goods.reserve_ratio=1
        session.commit()
        self.send_success()