from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_
import dal.models as models
from handlers.base.pub_web import RecordBaseHandler
from handlers.base.pub_func import QuryListDictFunc, TimeFunc, check_float
from settings import XINZHI_KEY
import requests, json ,datetime
from handlers.common import UpdateWebSocket


class Home(RecordBaseHandler):
    def get(self):
        return self.render("operator/index.html")

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
