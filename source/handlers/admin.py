from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_, func
import dal.models as models
from handlers.base.pub_web import AdminBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float, PubMethod
import requests, json , datetime
from handlers.celery_autowork_task import export_statistic_data_and_mail
from handlers.common import UpdateWebSocket

class ShopManage(AdminBaseHandler):
    """ 门店管理
    """
    @AdminBaseHandler.check_arguments("action?:str","shop_id?:int")
    def get(self):
        action=self.args.get("action","")
        if action=="get_shop_demand":
            shop_id=self.args.get("shop_id",0)
            current_shop=self.session.query(models.Shop)\
                                     .filter_by(id=shop_id)\
                                     .first()
            shop_info={
                "shop_id":shop_id,
                "shop_name":current_shop.shop_name,
                "city_code":current_shop.shop_city
            }
            return self.render("admin/shop-record.html",shop_info=shop_info)
        else:
            return self.render("admin/home.html")

    @AdminBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="get_all_shops":
            return self.get_all_shops()
        elif action=="get_shop_demand":
            return self.get_shop_demand()
        elif action=="get_weather_by_date":
            return self.get_weather_by_date()
        elif action=="export_goods_and_email":
            return self.export_goods_and_email()
        else:
            return self.send_error(404)

    @AdminBaseHandler.check_arguments("shop_id:int","date:str")
    def get_shop_demand(self):
        """根据店铺id按天查询的要货信息
        """
        shop_id=self.args.get("shop_id",0)
        date=self.args["date"]
        start_datetime = datetime.datetime.strptime(date, "%Y-%m-%d")
        end_datetime = start_datetime + datetime.timedelta(days=1)
        session = self.session
        Demand = models.Demand
        Accountinfo = models.Accountinfo
        Goods = models.Goods
        # 首先根据分组查询组内最新的一条记录的id
        demands_ids=session.query(func.max(Demand.id))\
                                  .filter(Demand.create_date>=start_datetime,\
                                            Demand.create_date<=end_datetime,\
                                            Demand.shop_id==shop_id)\
                                  .group_by(Demand.goods_id)\
                                  .all()
        ids_list=[x[0] for x in demands_ids]
        # 再根据id取查询其他信息
        all_demands=session.query(Demand,Accountinfo,Goods)\
                           .join(Accountinfo,Demand.opretor_id==Accountinfo.id)\
                           .join(Goods,Demand.goods_id==Goods.id)\
                           .filter(Demand.id.in_(ids_list))\
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
        return self.send_success(data_list=data_list)

    @AdminBaseHandler.check_arguments("date:str")
    def get_all_shops(self):
        """获取当前用户管理的所有店铺 同时获取订货单数查询，要求按日期
        """
        date=self.args["date"]
        start_datetime = datetime.datetime.strptime(date, "%Y-%m-%d")
        end_datetime = start_datetime + datetime.timedelta(days=1)
        session = self.session
        Demand = models.Demand
        Shop = models.Shop
        Goods=models.Goods
        ShopGoods=models.ShopGoods
        data_list=[]
        HireLink=models.HireLink
        hire_links=session.query(HireLink)\
                          .filter_by(staff_id=self.current_user.id)\
                          .all()
        admin_shop_id_list=[]
        for each_hire_link in hire_links:
            admin_shop_id_list.append(each_hire_link.shop_id)
        market_id =session.query(Shop.market_id)\
                                .filter_by(id=admin_shop_id_list[0])\
                                .first()
        all_shops =session.query(Shop)\
                          .filter(Shop.id.in_(admin_shop_id_list),\
                                    Shop.market_id==market_id[0])\
                          .all()
        for each_shop in all_shops:
            query_base=session.query(Goods.id)\
                               .join(Demand,Demand.goods_id==Goods.id)\
                               .filter_by(shop_id=each_shop.id)\
                               .filter(Demand.create_date>=start_datetime,\
                                        Demand.create_date<=end_datetime)\
                               .distinct()
            # 获取水果和蔬菜的订货量
            sum_fruit=query_base.filter(Goods.classify==1)\
                                            .count()
            sum_vegetables=query_base.filter(Goods.classify==2)\
                                                 .count()
            sum_all_demands=sum_fruit+sum_vegetables
            # 获取水果和蔬菜的总数，这里为啥不直接获取shop表中的值呢，因为发现在添加和编辑的时候
            # 需要随意更改商品所属店铺，这样就会造成该商品存在于店铺的的情况变化复杂，所以为了简单
            # 以后要把这两个字段直接去掉，然后用查询的方式获取
            count_query_base=session.query(ShopGoods)\
                                .join(Goods,ShopGoods.goods_id==Goods.id)\
                                .filter(ShopGoods.shop_id==each_shop.id,\
                                        ShopGoods.status!=-1)
            fruit_count=count_query_base.filter(Goods.classify==1).count()
            vegetables_count=count_query_base.filter(Goods.classify==2).count()
            each_shop_dict ={
                "id":each_shop.id,
                "shop_name":each_shop.shop_name,
                "shop_trademark_url":each_shop.shop_trademark_url,
                "fruit_count":fruit_count,
                "vegetables_count":vegetables_count,
                "demand_count":sum_all_demands,
                "sum_fruit":sum_fruit,
                "sum_vegetables":sum_vegetables
            }
            data_list.append(each_shop_dict)
        return self.send_success(data_list=data_list)

    @AdminBaseHandler.check_arguments("date:str")
    def get_weather_by_date(self):
        """ 获取给定日期的天气和节日信息
        """
        date=self.args["date"]
        current_weekday=datetime.datetime.strptime(date,"%Y-%m-%d").weekday()
        week_list={0:"周一",1:"周二",2:"周三",3:"周四",4:"周五",5:"周六",6:"周日"}
        HistoryWeatherRecord=models.HistoryWeatherRecord
        this_weather=self.session.query(HistoryWeatherRecord)\
                                 .filter_by(create_date=date)\
                                 .first()
        # 获取节日
        holiday="无"
        if str(date) in holiday_dict:
            holiday=holiday_dict[date]
        elif current_weekday in [5,6]:
            holiday="周末"
        weather_dict={
            "weekday":week_list.get(current_weekday,"周一"),
            "low_temperature":0,
            "high_temperature":0,
            "weather":"无",
            "holiday":holiday
        }
        if this_weather:
            weather_dict["low_temperature"]=this_weather.low_temperature
            weather_dict["high_temperature"]=this_weather.high_temperature
            weather_dict["weather"]=this_weather.weather
        return self.send_success(weather_dict=weather_dict)

    @AdminBaseHandler.check_arguments("email_address:str")
    def export_goods_and_email(self):
        email_address=[]
        email_address.append(self.args["email_address"])
        current_user_id=self.current_user.id
        HireLink=models.HireLink
        Shop=models.Shop
        market_id=self.session.query(Shop.market_id)\
                                .join(HireLink,Shop.id==HireLink.shop_id)\
                                .filter(HireLink.staff_id==current_user_id,\
                                        HireLink.active_admin==1)\
                                .first()
        export_statistic_data_and_mail.delay(email_address,market_id[0])
        return self.send_success()

class GoodsManage(AdminBaseHandler):
    """商品管理
    """
    @AdminBaseHandler.check_arguments("action?:str","goods_id?:int")
    def get(self):
        action = self.args.get("action","")
        if action in ["add_goods","edit_goods"]:
            goods_id=self.args.get("goods_id",0)
            session=self.session
            ShopGoods=models.ShopGoods
            Shop=models.Shop
            current_user_id=self.current_user.id
            # 获取管理员管理的所有店铺
            shop_list,shop_ids = PubMethod.get_all_shops(session,current_user_id)

            # 获取商品所在的店铺列表
            shop_goods=session.query(ShopGoods.shop_id)\
                                .filter_by(goods_id=goods_id)\
                                .filter(ShopGoods.status.in_([1]),\
                                        ShopGoods.shop_id.in_(shop_ids))\
                                .all()
            goods_shop_list=[x.shop_id for x in shop_goods]
        if action=="add_goods":
            return self.render("admin/add-edit-goods.html",goods_info={},\
                                shop_list=shop_list,goods_shop_list=goods_shop_list)
        elif action=="edit_goods":
            current_goods=session.query(models.Goods)\
                                      .filter_by(id=goods_id)\
                                      .first()
            if not current_goods:
                return self.send_fail("当前商品不存在")
            goods_info={
                "goods_id":goods_id,
                "goods_name":current_goods.goods_name,
                "unit":current_goods.unit,
                "classify":current_goods.classify,
                "goods_code":current_goods.goods_code,
                "status":current_goods.status,
                "shop_list":shop_list,
                "goods_shop_list":goods_shop_list
            }
            return self.render("admin/add-edit-goods.html",goods_info=goods_info,\
                                shop_list=shop_list,goods_shop_list=goods_shop_list)
        elif action=="reserve_ratio":
            return self.render("admin/set-coefficient.html")
        else:
            return self.render("admin/home.html")

    @AdminBaseHandler.check_arguments("action:str")
    def post(self):
        action = self.args["action"]
        if action=="get_all_goods":
            return self.get_all_goods_by_classify()
        elif action=="add_goods":
            return self.add_or_edit_goods()
        elif action=="edit_goods":
            return self.add_or_edit_goods()
        elif action=="get_reserve_ratio":
            return self.get_reserve_ratio()
        elif action=="get_reserve_ratio_shop":
            return self.get_reserve_ratio_shop()
        elif action=="set_reserve_ratio":
            return self.set_reserve_ratio()
        elif action=="get_reserve_ratio_discount":
            return self.get_reserve_ratio_discount()
        elif action=="set_reserve_ratio_discount":
            return self.set_reserve_ratio_discount()
        else:
            return self.send_error(404)

    @AdminBaseHandler.check_arguments("classify:int","page?int")
    def get_all_goods_by_classify(self):
        """根据分类获取商品信息  同时获取当天的订货单数查询
        """
        start_datetime = datetime.date.today()
        end_datetime = start_datetime + datetime.timedelta(days=1)
        session = self.session
        classify = self.args["classify"]
        page=self.args.get("page",0)
        page_num=10
        if classify==3:
            #　表示获取水果和蔬菜
            classify_list=[1,2]
        else:
            classify_list=[classify]
        all_goods_list =[]
        Goods=models.Goods
        Demand=models.Demand
        Shop=models.Shop

        # 获取当前管理员所管理的店铺
        HireLink=models.HireLink
        hire_links=session.query(HireLink)\
                          .filter_by(staff_id=self.current_user.id,\
                                    active_admin=1)\
                          .all()
        admin_shop_id_list=[]
        for each_hire_link in hire_links:
            admin_shop_id_list.append(each_hire_link.shop_id)
        market_id=session.query(Shop.market_id).filter_by(id=admin_shop_id_list[0]).first()
        # 以下注释的部分是订货量不排序获取的商品数据  ====================begin==================
        # all_goods_base = session.query(Goods)\
        #                         .filter(Goods.status!=-1,\
        #                             Goods.classify.in_(classify_list),\
        #                             Goods.market_id==market_id[0])
        # total_page=int(all_goods_base.count()/page_num)
        # if all_goods_base.count()%page_num:
        #     total_page+=1
        # # 请求水果或者蔬菜的时候分页，请求所有的时候不分页
        # if classify==3:
        #     all_goods=all_goods_base.all()
        # else:
        #     all_goods=all_goods_base.offset(page*page_num)\
        #                             .limit(page_num)\
        #                             .all()
        # for each_goods in all_goods:
        #     sum_all_demands=session.query(Demand)\
        #                             .filter_by(goods_id=each_goods.id)\
        #                             .filter(Demand.create_date>=start_datetime,\
        #                                     Demand.create_date<=end_datetime,\
        #                                     Demand.shop_id.in_(admin_shop_id_list))\
        #                             .count()
        #     each_goods_dict ={
        #         "id":each_goods.id,
        #         "goods_name":each_goods.goods_name,
        #         "goods_code":each_goods.goods_code,
        #         "unit":each_goods.unit_text,
        #         "demand_count":sum_all_demands
        #     }
        #     all_goods_list.append(each_goods_dict)
        # 以上注释的部分是订货量不排序获取的商品数据  ====================end==================

        goods_count=session.query(Goods.id)\
                            .filter(Goods.status!=-1,\
                                    Goods.classify.in_(classify_list),\
                                    Goods.market_id==market_id[0])\
                            .count()
        total_page=int(goods_count/page_num)
        if goods_count%page_num:
            total_page+=1
        ordered_demands=session.query(Demand.goods_id,func.count(Demand.id),\
                                        Goods.goods_name,Goods.goods_code,Goods.unit,Goods.classify)\
                                .join(Goods,Demand.goods_id==Goods.id)\
                                .filter(Demand.create_date>=start_datetime,\
                                            Demand.create_date<=end_datetime,\
                                            Demand.shop_id.in_(admin_shop_id_list),\
                                            Goods.classify.in_(classify_list))\
                                .group_by(Demand.goods_id)\
                                .order_by(func.count(Demand.id).desc())
        all_goods_base=session.query(Goods)\
                            .filter(Goods.status!=-1,\
                                    Goods.classify.in_(classify_list),\
                                    Goods.market_id==market_id[0])

        # 请求水果或者蔬菜的时候分页，请求所有的时候不分页
        if classify==3:
            all_demands=ordered_demands.all()
            all_goods=all_goods_base.all()
        else:
            all_demands=ordered_demands.offset(page*page_num)\
                                        .limit(page_num)\
                                        .all()
            all_goods=all_goods_base.offset(page*page_num)\
                                    .limit(page_num)\
                                    .all()
        demand_goods_ids=[]
        # 先将有订货数据排序好的商品加入列表
        for each_demand in all_demands:
            unit_list={1:"kg",2:"PCS"}
            each_goods_dict ={
                "id":each_demand[0],
                "goods_name":each_demand[2],
                "goods_code":each_demand[3],
                "unit":unit_list.get(each_demand[4],"未知"),
                "demand_count":each_demand[1],
                "classify":each_demand[5]
            }
            demand_goods_ids.append(each_demand[0])
            all_goods_list.append(each_goods_dict)
        # 再将没有订货数据的剩余商品加入列表
        for each_goods in all_goods:
            if each_goods.id not in demand_goods_ids:
                each_goods_dict ={
                    "id":each_goods.id,
                    "goods_name":each_goods.goods_name,
                    "goods_code":each_goods.goods_code,
                    "unit":each_goods.unit_text,
                    "demand_count":0,
                    "classify":each_goods.classify
                }
                all_goods_list.append(each_goods_dict)
            # 当分页请求数据的时候，如果已经得到了对应的数据 则不再追加
            if len(all_goods_list)>=page_num and classify!=3:
                break

        return self.send_success(all_goods=all_goods_list,total_page=total_page)

    @AdminBaseHandler.check_arguments("classify:int","goods_name:str","goods_code:int",\
                                        "unit:int","status?:int","goods_id?:int","shop_list?:str")
    def add_or_edit_goods(self):
        """添加或者编辑商品
        """
        classify=self.args.get("classify",1)
        goods_name=self.args.get("goods_name","")
        goods_code=self.args["goods_code"]
        unit=self.args.get("unit",1)
        status=self.args.get("status",1)
        goods_id=self.args.get("goods_id",0)
        new_shop_list=eval(self.args.get("shop_list",[]))
        Goods=models.Goods
        Shop=models.Shop
        session=self.session
        ShopGoods=models.ShopGoods
        HireLink=models.HireLink
        new_goods=None
        current_user_id=self.current_user.id
        if goods_id:
            # 前端传来了goods_id 则表示这次是编辑商品
            exit_goods=session.query(Goods)\
                                .filter_by(id=goods_id)\
                                .first()
            # 编辑商品的时候需要判断，商品编号是否重复
            same_code_goods=session.query(Goods)\
                                    .filter_by(goods_code=goods_code)\
                                    .first()
            if same_code_goods and same_code_goods.id!=goods_id:
                # 表示商品编号已经存在
                return self.send_fail("该商品编号已经存在，如果确认是添加商品，请修改商品编号")
            new_goods=exit_goods
        else:
            # 反之则为添加商品，首先判断商品编号有没有重复
            exit_goods=session.query(Goods)\
                                .filter_by(goods_code=goods_code)\
                                .first()
            if exit_goods:
                # 表示商品编号已经存在
                return self.send_fail("该商品编号已经存在，如果确认是添加商品，请修改商品编号")
            # 添加商品,由于后续增加了market_id的概念，需要根据店铺所在的market同步更改goods的market_id
            one_shop=session.query(Shop.market_id)\
                            .join(HireLink,Shop.id==HireLink.shop_id)\
                            .filter(HireLink.staff_id==current_user_id,\
                                    HireLink.active_admin==1)\
                            .first()
            new_goods=Goods(goods_code=goods_code,market_id=one_shop[0])
            session.add(new_goods)
            session.flush()

        new_goods.classify=classify
        new_goods.goods_name=goods_name
        new_goods.unit=unit
        new_goods.status=status
        goods_id=new_goods.id
        # 对应处理每个店铺与该商品有关的信息
        all_shops_goods=session.query(ShopGoods).filter_by(goods_id=goods_id).all()
        old_shop_list=[x.shop_id for x in all_shops_goods]
        #　如果是删除商品　则要对应地删除每个店铺里面的商品
        if status==-1:
            for each_shop_goods in all_shops_goods:
                each_shop_goods.status=-1
        else:
            for _id in new_shop_list:
                if _id in old_shop_list:
                    the_shop_goods=session.query(ShopGoods).filter_by(shop_id=_id,goods_id=goods_id).first()
                    the_shop_goods.status=status
                else:
                    new_shop_goods=ShopGoods(shop_id=_id,goods_id=goods_id)
                    session.add(new_shop_goods)
            for _id in old_shop_list:
                if _id not in new_shop_list:
                    the_shop_goods=session.query(ShopGoods).filter_by(shop_id=_id,goods_id=goods_id).first()
                    the_shop_goods.status=-1
        session.commit()
        return self.send_success()

    @AdminBaseHandler.check_arguments("classify:int")
    def get_reserve_ratio(self):
        """获取各个区域的预订系数
        """
        session=self.session
        classify=self.args["classify"]
        data_list=[]
        ShopGoods=models.ShopGoods
        Shop=models.Shop
        Goods=models.Goods
        # 获取当前管理员所管理的店铺所在的
        HireLink=models.HireLink
        hire_links=session.query(HireLink)\
                          .filter_by(staff_id=self.current_user.id,\
                                    active_admin=1)\
                          .all()
        admin_shop_id_list=[x.shop_id for x in hire_links]
        distinct_regions=session.query(Shop.shop_region,func.min(Shop.shop_city),ShopGoods.reserve_ratio,ShopGoods.reserve_cycle)\
                                .join(ShopGoods,Shop.id==ShopGoods.shop_id)\
                                .join(Goods,ShopGoods.goods_id==Goods.id)\
                                .filter(Shop.id.in_(admin_shop_id_list),\
                                        Goods.classify==classify)\
                                .group_by(Shop.shop_region)\
                                .all()
        for each_ratio in distinct_regions:
            region_name=region_dict[each_ratio[0].strip()]
            ratio_dict={
                "shop_region":each_ratio[0],
                "region_name":region_name,
                "shop_city":each_ratio[1],
                "reserve_ratio":each_ratio[2],
                "reserve_cycle":each_ratio[3]
            }
            data_list.append(ratio_dict)
        return self.send_success(data_list=data_list)

    @AdminBaseHandler.check_arguments("shop_id:int")
    def get_reserve_ratio_shop(self):
        """获取单个店铺的预订量系数
        """
        session=self.session
        shop_id=self.args["shop_id"]
        fruit_ratio=0
        vegetables_ratio=0
        return self.send_success(fruit_ratio=fruit_ratio,vegetables_ratio=vegetables_ratio)

    @AdminBaseHandler.check_arguments("shop_region:str","reserve_ratio:float","classify:int")
    def set_reserve_ratio(self):
        """ 设置某个区域预订系数
        """
        session=self.session
        shop_region=self.args["shop_region"]
        reserve_ratio=self.args["reserve_ratio"]
        classify=self.args["classify"]
        Shop=models.Shop
        Goods=models.Goods
        ShopGoods=models.ShopGoods
        HireLink=models.HireLink
        current_user_id=self.current_user.id
        # 获取分区下的管理员管理的所有店铺
        all_shops=session.query(Shop.id)\
                            .join(HireLink,Shop.id==HireLink.shop_id)\
                            .filter(Shop.shop_region==shop_region,\
                                    HireLink.staff_id==current_user_id,\
                                    HireLink.active_admin==1)\
                            .all()
        shop_ids=[x.id for x in all_shops]
        # 更新每个店铺下所有商品的预订系数,要去除促销商品，促销商品单独设置预定系数(discount=1)
        all_shops_goods=session.query(ShopGoods)\
                                .join(Goods,ShopGoods.goods_id==Goods.id)\
                                .filter(ShopGoods.shop_id.in_(shop_ids),\
                                        Goods.classify==classify,\
                                        ShopGoods.discount==0)\
                                .all()
        for each_shop_goods in all_shops_goods:
            each_shop_goods.reserve_ratio=reserve_ratio
        session.commit()
        for _id in shop_ids:
            update_dict={
                "shop_id":_id,
                "reserve_ratio":reserve_ratio,
                "classify":classify
            }
            UpdateWebSocket.send_ratio_updates(update_dict)
        return self.send_success()

    def get_reserve_ratio_discount(self):
        """获取管理员管理的店铺促销商品的预定系数
        """
        session=self.session
        Shop=models.Shop
        Goods=models.Goods
        ShopGoods=models.ShopGoods
        HireLink=models.HireLink
        current_user_id=self.current_user.id
        # 获取管理员管理的所有店铺
        all_shops=session.query(Shop.id)\
                            .join(HireLink,Shop.id==HireLink.shop_id)\
                            .filter(HireLink.staff_id==current_user_id,\
                                    HireLink.active_admin==1)\
                            .all()
        shop_ids=[x.id for x in all_shops]
        all_info=session.query(ShopGoods,Shop,Goods)\
                            .join(Shop,ShopGoods.shop_id==Shop.id)\
                            .join(Goods,ShopGoods.goods_id==Goods.id)\
                            .filter(ShopGoods.discount==1,\
                                    Shop.id.in_(shop_ids))\
                            .all()
        data_list=[]
        for element in all_info:
            shop_goods=element[0]
            shop=element[1]
            goods=element[2]
            ratio_dict={
                "shop_id":shop.id,
                "shop_name":shop.shop_name,
                "goods_id":goods.id,
                "goods_name":goods.goods_name,
                "shop_goods_id":shop_goods.id,
                "reserve_ratio":shop_goods.reserve_ratio,
                "reserve_cycle":shop_goods.reserve_cycle
            }
            data_list.append(ratio_dict)
        return self.send_success(data_list=data_list)

    @AdminBaseHandler.check_arguments("shop_goods_id:int","reserve_ratio:float")
    def set_reserve_ratio_discount(self):
        """设置促销商品的预定系数
        """
        session=self.session
        reserve_ratio=self.args["reserve_ratio"]
        shop_goods_id=self.args["shop_goods_id"]
        ShopGoods=models.ShopGoods
        Goods=models.Goods
        shop_goods,classify=session.query(ShopGoods,Goods.classify)\
                            .join(Goods,ShopGoods.goods_id==Goods.id)\
                            .filter(ShopGoods.id==shop_goods_id)\
                            .first()
        shop_goods.reserve_ratio=reserve_ratio
        session.commit()
        update_dict={
                "shop_id":shop_goods.shop_id,
                "reserve_ratio":reserve_ratio,
                "classify":classify,
                "shop_goods_id":shop_goods.id
            }
        UpdateWebSocket.send_ratio_updates(update_dict)
        return self.send_success()


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