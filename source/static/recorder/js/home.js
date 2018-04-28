var chart_data=null, width = 0,page=0,finished=false,nomore=false;

var myscroll_1 = null;
var myscroll_2 = null;
var cur_date = '';
var all_goods_code = [];
var cur_scan_goods_id = 0;
var cur_scan_goods_name = '';
var cur_scan_goods_unit = '';
var cur_shop_city_code = 0;
var all_goods_list = [];
var cur_goods_coefficient = 0;
var cur_goods_cycle = 0;
var cur_tab_index = $.getUrlParam('tab');
var domain = window.location.href.split('//')[1].split('/')[0];
var websocket_connected_count = 0;


$(document).ready(function(){
    cur_date = getCurDate()
    var wrapper_height = $(window).height()-150;
    $('#wrapper').css("height",wrapper_height+"px");
    $('.no_staff_result').css("width",$(window).height());
    var wrapper1_height = $(window).height()-163;
    $('#wrapper1').css("height",wrapper1_height+"px");
    $('#scroller1').css("min-height",wrapper1_height+"px");
    initIscroll();        // 初始化iscroll
    if(cur_tab_index == 0){
        getShopList();       // 获取店铺列表
        getGoodsList(1);     // 获取商品列表
        getGoodsForSearch(3); // 获取本地查询所需数据
    }else if(cur_tab_index==1){
        getCurDate();        // 获取当前时间
        getWeatherByDay(cur_date);  // 获取当天天气
        getRecorderRecord(cur_date); // 获取录入记录
    }else{
        getCurUserInfo();     // 获取个人中心数据
    }
    setTimeout(function(){
        cookie.setCookie("user_type","recorder");
        newWebSocket();
    },5000)
    var tab= $.getUrlParam("tab")||0;
    $(".bm_tab_list>li").removeClass("active").eq(tab).addClass("active");
    $(".page_item").addClass("hide").eq(tab).removeClass("hide");
}).on("click",".bm_tab_list>li",function(){//底部tab
    var index = $(this).index();
    $(".bm_tab_list>li").removeClass("active").eq(index).addClass("active");
    $(".page_item").addClass("hide").eq(index).removeClass("hide");
    if(index==0){
        if($('.goods_list_box').find('li').length == 0){
            getShopList();       // 获取店铺列表
            getGoodsList(1);     // 获取商品列表
            getGoodsForSearch(3); // 获取本地查询所需数据
        }
        history.replaceState(null, "华中果蔬助手", "/recorder/goodsmanage?tab="+index);
    }else if(index==1){
        getRecorderRecord(cur_date); // 获取录入记录
        history.replaceState(null, "华中果蔬助手", "/recorder/goodsmanage?tab="+index);
        myscroll_1.refresh();
    }else{
        if(!$('.user_phone').text()){
            getCurUserInfo();     // 获取个人中心数据
        }
        history.replaceState(null, "华中果蔬助手", "/recorder/goodsmanage?tab="+index);
    }
}).on("click",".switch_shop",function(){
    // $(".pop-switch-shop").removeClass("hide");
}).on("click",".more_shop_list>.item",function(){
    var id = $(this).attr("data-id");
    switchShop(id);
}).on('click', '.switch_type span', function() {  //切换商品类型
    var $this = $(this);
    var type = parseInt($(this).attr("data-type"));
    if($this.hasClass('active')){
        return false;
    }
    $('.switch_type').find('span').removeClass('active');
    $this.addClass('active');
    if(type == 1){
        $('.fruit_goods_list_box').removeClass('hide');
        $('.vegetable_goods_list_box').addClass('hide');
    }else{
        $('.fruit_goods_list_box').addClass('hide');
        $('.vegetable_goods_list_box').removeClass('hide');
    }
    getGoodsList(type);
}).on('click', '.goods_list_box li', function() {
    var goods_id = $(this).attr("data-id");
    var goods_name = $(this).text();
    var goods_unit = $(this).attr("data-unit");
    var shop_goods_id = $(this).attr("data-shopgoods");
    var discount = parseInt($(this).attr("data-dis"));
    if(discount==0){     // 当前商品是否是促销商品
        $('.goods_promotion').removeClass('goods-promotion-active');
    }else{
        $('.goods_promotion').addClass('goods-promotion-active');
    }
    cur_goods_coefficient = parseFloat($(this).attr("data-ratio"));
    cur_goods_cycle = parseFloat($(this).attr("data-cycle"));
    $("#cur_entering_goods_id").attr("data-id",goods_id);
    $("#cur_entering_goods_id").text(goods_name);
    $('.goods_unit').text(goods_unit);
    $('.goods_promotion').attr("data-id",shop_goods_id);
    clearEnteringData();
    $("#pop_entering_goods").removeClass('hide');
    actionIn(".entering-goods-content",'fadeInUp',0.2,"ease");
}).on('click', '.search_goods_list_box li', function() {
    var goods_id = $(this).attr("data-id");
    var goods_name = $(this).text();
    var goods_unit = $(this).attr("data-unit");
    $("#cur_entering_goods_id").attr("data-id",goods_id);
    $("#cur_entering_goods_id").text(goods_name);
    $('.goods_unit').text(goods_unit);
    clearEnteringData();
    $(".pop-search").addClass("hide");
    $("#pop_entering_goods").removeClass('hide');
    actionIn(".entering-goods-content",'fadeInUp',0.2,"ease");
}).on('click', '.goods_scan', function() {
    scanQRCode();
}).on('click', '.search_input', function() {
    $('.pop-search-box').removeClass('hide');
    $('#search_input_value').focus();
}).on('click', '.backhide', function() {
    $('.pop-search-box').addClass('hide');
}).on('click', '.predict-coefficient-box', function() {
    $('.modify-coefficient').val('');
    $("#pop_entering_keyboard").removeClass('hide');
    actionIn(".pop-keyboard-content",'fadeInUp',0.2,"ease");
}).on("click",".close_keyb",function(){
    $(this).closest('.pop-bwin').addClass('hide');
}).on('click', '.keyboard_cancel', function() {
    // actionOut(".pop-keyboard-content",'fadeOutDown',0.3,"ease");
    $(this).closest('#pop_entering_keyboard').addClass('hide');
}).on('click', '.set_mcalendar', function() {
    var cur_select_date = $('.choose_date').val();
    if(CompareDate(cur_select_date,cur_date)){
        return Tip('请选择'+cur_date+'之前的日期');
    }
    $(".wrap-loading-box").removeClass("hide");
    setTimeout(function(){
        getRecorderRecord(cur_select_date);
        getWeatherByDay(cur_select_date);
    },500)
}).on('click', '.entering-item', function() {  //录入页js开始处
    var $this = $(this);
    if($this.hasClass('entering-item-active')){
        return false;
    }
    $('.entering-item').removeClass('entering-item-active');
    $this.addClass('entering-item-active');
}).on('click', '.entering_item', function() {
    autoWriteIn();
}).on('click', '.sure_entering_goods', function() {
    // typeInGoodsInfo();
}).on('click', '.cur_day_record_list_item', function() {
    var id = parseInt($(this).attr("data-id"));
    window.location.href = '/common/goodsdetail?action=get_details&goods_id='+id;
}).on('click', '.clear_search_content', function() {
    // $("#search_input_value").val('');
    // $("#search_input_value").focus();
}).on('click', '.photo_upload', function() {
    Tip('该功能暂未开放');
}).on('touchend', '.keyboard-tb td', function() {
    if(!$('.entering-item-active').hasClass('order_amount')) {
        if($('.yesterday_wasted').val() && $('.yesterday_sale').val() && $('.current_stock').val()){
            autoWriteIn();
        }
    }
}).on('click', '.go_to_admin', function() {
    enterInto('admin')
}).on('click', '.goods_promotion', function() {
    if($(this).hasClass('goods-promotion-active')){
        var discount = 0;
    }else{
        // $(this).addClass('goods-promotion-active');
        var discount = 1;
    }
    setSalesPromotion($(this),discount);
})


// 切换端口
function enterInto(target){
    var url = "/common/profile";
    var args = {
        action: 'change_role',
        target: target
    }
    $.postJson(url, args, function(res){
        if(res.success){
            window.location.href = res.next_url;
        }else{
            Tip(res.error_text);
        }
    })
}

// 促销商品标记
function setSalesPromotion($obj,dis){
    if($obj.hasClass("forbit")){
        return false;
    }
    var shop_goods_id = parseInt($(".goods_promotion").attr("data-id"));
    var url = "/recorder/enteringgoods";
    var args = {
        action: "set_goods_discount",
        shop_goods_id: shop_goods_id,
        discount: dis
    }
    $obj.addClass('forbit');
    $.postJson(url, args, function(res){
        $obj.removeClass('forbit');
        if(res.success){
            if(dis == 0){
                $('.goods_promotion').removeClass('goods-promotion-active');
                Tip("取消促销商品设置");
            }else{
                $('.goods_promotion').addClass('goods-promotion-active');
                Tip("成功设置为促销商品");
            }
        }else{
            Tip(res.error_text)
        }
    })
}

// 监听录入项的前三项，完成预定量的自动添加
function autoWriteIn(){
    var item_1 = parseFloat($('.yesterday_wasted').val());
    var item_2 = parseFloat($('.yesterday_sale').val());
    var item_3 = parseFloat($('.current_stock').val());
    
    var tomorrow_reserve_val = 0;
    if(item_1 && item_2 && item_3){
        tomorrow_reserve_val = parseFloat(((item_1 + item_2)*cur_goods_coefficient - item_3)*cur_goods_cycle);
        tomorrow_reserve_val = tomorrow_reserve_val.toFixed(2);
        $("#order_amount").val(tomorrow_reserve_val);
    }
}
// 录入商品信息
function typeInGoodsInfo(){
    var url = '/recorder/enteringgoods';

    var goods_id = parseInt($("#cur_entering_goods_id").attr("data-id"));
    var shop_id = parseInt($('.cur_shop_name').attr("data-id"));
    var yesterday_wasted = $(".yesterday_wasted").val();
    if(!yesterday_wasted){
        return Tip('请输入昨日损耗');
    }
    var yesterday_sale = $(".yesterday_sale").val();
    if(!yesterday_sale){
        return Tip('请输入昨日销量');
    }
    var current_stock = $(".current_stock").val();
    if(!current_stock){
        return Tip("请输入当前库存");
    }
    var today_arrival = $(".today_arrival").val();
    if(!today_arrival){
        return Tip('请输入今日到货量');
    }
    var today_price = $(".today_price").val();
    if(!today_price){
        return Tip('请输入今日进价');
    }
    var today_purchase_price = $(".today_purchase_price").val();
    if(!today_purchase_price){
        return Tip('请输入今日售价');
    }
    
    var order_amount = parseFloat($("#order_amount").val());
    if(order_amount<=0){
        return Tip('明日预定量不能小于0')
    }
    var args = {
        action: 'stock_in',
        goods_id: goods_id,
        shop_id: shop_id,
        order_amount: order_amount,
        yesterday_wasted: yesterday_wasted,
        yesterday_sale: yesterday_sale,
        current_stock: current_stock,
        today_arrival: today_arrival,
        today_purchase_price: today_purchase_price,
        today_price: today_price
    }
    $.postJson(url, args, function(res){
        if(res.success){
            Tip('成功录入商品');
            $("#pop_entering_goods").addClass('hide');
        }else{
            return Tip(res.error_text);
        }
    })
}

// 清空录入框数据
function clearEnteringData(){
    $('#order_amount').val('');
    // $('.tomorrow-order-count-box').addClass('hide');
    $('.yesterday_wasted').val('');
    $('.yesterday_sale').val('');
    $('.current_stock').val('');
    $('.today_arrival').val('');
    $('.today_purchase_price').val('');
    $('.today_price').val('');
    $('.entering-item').removeClass('entering-item-active');
    $('.yesterday_wasted').parent('.entering-item').addClass('entering-item-active');
}

// 初始化iscroll
function initIscroll(){
    myscroll_1 = new iScroll("wrapper",{
        hScroll: true,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false
    })

    myscroll_2 = new iScroll("wrapper1",{
        hScroll: false,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false,
        onScrollMove:function(){
            if (this.y > 40) {
                $('.pull-down-refresh').removeClass('hide')
            }
        },
        onScrollEnd:function(){
            if(!$('.pull-down-refresh').hasClass('hide')){
                var type = parseInt($('.switch_type').find('.active').attr("data-type"));
                setTimeout(function(){
                    getGoodsList(type);
                    $('.pull-down-refresh').addClass('hide');
                },600)
            }
        }
    })
}

// 得到当前的日期
function getCurDate(date){
    var isToday=false;
    if(!date){
        date = new Date();
        isToday=true;
    }
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = month<10?("0"+month):month;
    var day = date.getDate();
    day = day<10?("0"+day):day;
    var cur_time = year+"-"+month+"-"+day;
    if(isToday){
        today_str=cur_time;
    }
    $(".choose_date").val(cur_time);
    return cur_time;
}

// 调用android扫描订单相关
function scanQRCode(){
    if(navigator.userAgent.indexOf("senguo:app") >= 0||navigator.userAgent.indexOf("senguo:cfapp") >= 0||navigator.userAgent.indexOf("senguo:androidcfapp")>=0){
        try{
            window.NativeApi.scanQrString("scanQRCodeBack");
        }catch(e){
            Tip("当前APP版本过低，请前往个人中心更新");
        }
    }
}
function scanQRCodeBack(code){
    if (code) {
        for(var i=0;i<all_goods_code.length;i++){
            if(all_goods_code[i].goods_code == code){
                $("#cur_entering_goods_id").attr("data-id",all_goods_code[i].id);
                $("#cur_entering_goods_id").text(all_goods_code[i].goods_name);
                $('.goods_unit').text(all_goods_code[i].unit);
                $('.goods_promotion').attr("data-id",all_goods_code[i].shop_goods_id);
                var discount = all_goods_code[i].discount;
                if(discount==0){     // 当前商品是否是促销商品
                    $('.goods_promotion').removeClass('goods-promotion-active');
                }else if(discount == 1){
                    $('.goods_promotion').addClass('goods-promotion-active');
                }
                cur_goods_coefficient = all_goods_code[i].reserve_ratio;
                cur_goods_cycle = all_goods_code[i].reserve_cycle;
                clearEnteringData();
                $("#pop_entering_goods").removeClass('hide');
                actionIn(".entering-goods-content",'fadeInUp',0.2,"ease");
                // var url = "/recorder/enteringgoods?goods_code="+code;
                // window.location.href = url;
                return;
            }
        }
        return Tip("该商品不存在")
    }else{
        Tip("扫码失败，请重新扫码");
    }
}

// 获取商品列表
var goods_item = '{{each all_goods as data}}'+
                    '<li class="clip grey_btn goods_id_{{data["goods_id"]}} shop_goods_id_{{data["shop_goods_id"]}}" data-dis="{{data["discount"]}}" data-id="{{data["goods_id"]}}" data-shopgoods="{{data["shop_goods_id"]}} data-unit="{{data["unit"]}}" data-ratio="{{data["reserve_ratio"]}}" data-cycle="{{data["reserve_cycle"]}}">{{data["goods_name"]}}</li>'+
               '{{/each}}';
function getGoodsList(type){

    var url = '/recorder/goodsmanage';
    var args = {
        action: 'get_all_goods',
        classify: type
    }
    if(type==1){
        var $list = $('.fruit_goods_list_box');
    }else{
        var $list = $('.vegetable_goods_list_box');
    }
    $('.wrap-loading-box').removeClass('hide');
    $.postJson(url, args, function(res){
        if(res.success){
            $list.empty();
            var all_goods = res.all_goods;
            if(all_goods.length==0){
                var str = '<p class="no_staff_result">没有数据！</p>'
                $list.append(str);
            }else{
                var render = template.compile(goods_item);
                var html = render(res);
                $list.append(html);
            }
            setTimeout(function(){
                myscroll_2.refresh()
            },500)
            $(".wrap-loading-box").addClass("hide");
        }else{
            $(".wrap-loading-box").addClass("hide");
            return Tip(res.error_text);
        }
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    })
}

// 获取所有商品供本地查询
function getGoodsForSearch(type){
    var url = '/recorder/goodsmanage';
    var args = {
        action: 'get_all_goods',
        classify: type
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var all_goods = res.all_goods;
            for(var key in all_goods){
                all_goods_list.push(all_goods[key]);
            }
            toPinyin();
            for(var i=0;i<all_goods.length;i++){
                all_goods_code.push(all_goods[i]);
            }
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    })
}


// 获取录入记录
var record_item = '{{each data_list as data}}'+
                    '<ul class="cur_day_record_list_item grey_btn" data-id="{{data["goods_id"]}}">'+
                        '<li class="li-item-1 clip">{{data["goods_name"]}}</li>'+
                        '<li>{{data["unit"]}}</li>'+
                        '<li>{{data["order_amount"]}}</li>'+
                        '<li>{{data["yesterday_wasted"]}}</li>'+
                        '<li>{{data["yesterday_sale"]}}</li>'+
                        '<li>{{data["today_arrival"]}}</li>'+
                        '<li>{{data["today_purchase_price"]}}</li>'+
                        '<li>{{data["today_price"]}}</li>'+
                        '<li>{{data["current_stock"]}}</li>'+
                        '<li class="li-item-2">{{data["create_date"]}}</li>'+
                        '<li class="li-item-3 clip">{{data["opretor_name"]}}</li>'+
                    '</ul>'+
                  '{{/each}}';
function getRecorderRecord(date){
    var url = '/recorder/record';

    var args = {
        action: 'get_demand_record_by_date',
        date: date
    }
    $list = $('.cur_day_record_list_item');
    $.postJson(url, args, function(res){
        if(res.success){
            $list.remove();
            $('.no_staff_result').remove();
            var data_list = res.data_list;
            if(data_list.length==0){
                var str = '<p class="no_staff_result">没有数据！</p>'
                $('.record-list-box').append(str);
            }else{
                var render = template.compile(record_item);
                var html = render(res);
                $('.cur_day_record_list').append(html);

            }
            setTimeout(function(){
                myscroll_1.refresh()
            },500)
            $(".wrap-loading-box").addClass("hide");
        }else{
            $(".wrap-loading-box").addClass("hide");
            return Tip(res.error_text);
        }
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    })
}

// 获取单个店铺的商品预定量系数
function getCoefficient(){
    var url = '/admin/goodsmanage';
    var shop_id = $('.cur_shop_name').attr('data-id');
    var args = {
        action: 'get_reserve_ratio_shop',
        shop_id: shop_id
    }
    $.postJson(url,args,function(res){
        if(res.success){
            $('.switch_fruit').attr('data-ratio', res.fruit_ratio);
            $('.switch_vegetable').attr('data-ratio', res.vegetables_ratio);
        }else{
            return Tip(res.error_text);
        }
    })
}

// 设置预定量系数
function setCoefficient(){
    var num = parseFloat($('.modify-coefficient').val());
    if(!num){
        return Tip("请输入预定量系数");
    }
    var url = '/recorder/settings';
    var args = {
        action: 'set_order_ratio',
        order_ratio: num
    }
    $.postJson(url,args,function(res){
        if(res.success){
            $('#pop_entering_keyboard').addClass('hide');
            $('.predict_coefficient_val').text(num);
        }else{
           return Tip(res.error_text);
        }
    })
}

// 获取店铺列表
function getShopList(){
    var url = "/recorder/goodsmanage";
    var args = {
        action: 'get_all_shops'
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data_list = res.data_list;
            var str = '';
            if(data_list.length>0){
                for(var i=0;i<data_list.length;i++){
                    if(i == 0){
                        if(data_list[i].shop_trademark_url){
                            $('.cur_shop_img').attr("src",data_list[i].shop_trademark_url);
                        }
                        $('.cur_shop_name').text(data_list[i].shop_name);
                        $('.cur_shop_name').attr("data-id",data_list[i].id);
                        $('.cur_shop_name').attr("data-city",data_list[i].city_code);
                        cur_shop_city_code = data_list[i].city_code;
                        // getCoefficient();
                        // getWeatherInfo();
                    }
                    str += '<li class="item" data-id="'+data_list[i].id+'" data-city="'+data_list[i].city_code+'" data-url="'+data_list[i].shop_trademark_url+'"><a class="goods-edit-btn f16" href="javascript:;">'+data_list[i].shop_name+'</a></li>';
                }
            }
            $('.more_shop_list').empty().append(str);
        }else{
            return Tip(res.error_text);
        }
    })
}

//  获取个人信息
function getCurUserInfo(){
    var url = '/common/profile';

    var args = {
        action: 'get_profile'
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var account_dict = res.account_dict
            if(account_dict.headimgurl){
                $('.user_head_img').attr("src", account_dict.headimgurl);
            }
            $('.user_head_img').attr("url",account_dict.headimgurl);
            $('.user_nick_name').text(account_dict.realname);
            $('.user_sex').text(account_dict.sex_text);
            $('.user_phone').text(account_dict.phone);
            $('#pass_phone').val(account_dict.phone);
        }else{
            return Tip(res.error_text);
        }
    })
}

// 根据code获取商品信息
function getGoodsInfoByCode(code){
    var url = '/recorder/enteringgoods';
    var args = {
        action: '',
        goods_code: code
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var goods_info = res.goods_info;
            cur_scan_goods_id = goods_info.id;
            cur_scan_goods_name = goods_info.goods_name;
            cur_scan_goods_unit = goods_info.unit;
        }else{
            return Tip(res.error_text);
        }
    })
}

// 按天获取天气信息
function getWeatherByDay(date){
    var url = '/recorder/record';
    var args = {
        action: 'get_weather_by_date',
        city_code: cur_shop_city_code,
        date:date
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data = res.weather_dict;
            var str = data.weekday+'，'+data.weather+'，'+data.low_temperature+'~'+data.high_temperature+'℃';
            $('.record_weather_span').text(str);
        }else{
            return Tip(res.error_text);
        }
    })
}

// websocket连接
function newWebSocket(){
    var websocket = null;
    // 判断当前环境是否支持websocket
    if(window.WebSocket){
        if(!websocket){
            var ws_url ="wss://"+domain+"/updatewebsocket";
            websocket = new WebSocket(ws_url);
        }
    }else{
        // Tip("not support websocket");
    }
    
    // 连接成功建立的回调方法
    websocket.onopen = function(e){
        heartCheck.reset().start();      // 成功建立连接后，重置心跳检测
        // Tip("connected successfully")
    }
    // 连接发生错误，连接错误时会继续尝试发起连接（尝试5次）
    websocket.onerror = function() { 
        websocket_connected_count++;
        if(websocket_connected_count <= 5){
            newWebSocket()
        }
    }
    // 接受到消息的回调方法
    websocket.onmessage = function(e){
        heartCheck.reset().start();     // 如果获取到消息，说明连接是正常的，重置心跳检测
        var message = e.data;
        message = $.parseJSON(message);
        refreshView(message);
    }

    // 接受到服务端关闭连接时的回调方法
    websocket.onclose = function(){
        // Tip("断开连接");
    }

    // 监听窗口事件，当窗口关闭时，主动断开websocket连接，防止连接没断开就关闭窗口，server端报错
    window.onbeforeunload = function(){
        websocket.close();
    }

    // 心跳检测, 每隔一段时间检测连接状态，如果处于连接中，就向server端主动发送消息，来重置server端与客户端的最大连接时间，如果已经断开了，发起重连。
    var heartCheck = {
        timeout: 550000,        // 9分钟发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
        serverTimeoutObj: null,
        reset: function(){
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
        },
        start: function(){
            var self = this;
            this.serverTimeoutObj = setInterval(function(){
                if(websocket.readyState == 1){
                    websocket.send("ping");
                }else{
                    newWebSocket(); 
                }
            }, this.timeout)
        }
    }

}
// 刷新视图
function refreshView(obj){
    var shop_id = parseInt(obj.shop_id);
    var reserve_ratio = parseFloat(obj.reserve_ratio);
    var type = parseInt(obj.classify);
    var cur_shop_id = parseInt($('.cur_shop_name').attr("data-id"));
    if(obj.shop_goods_id){
        var shop_goods_id = parseInt(obj.shop_goods_id);
        if(cur_shop_id == shop_id){
            $('.shop_goods_id'+shop_goods_id).attr("data-ratio",reserve_ratio);
        }
    }else{
        if(cur_shop_id == shop_id){
            if(type == 1){
                $('.fruit_goods_list_box').find('li').attr("data-ratio",reserve_ratio);
            }else if(type == 2){
                $('.vegetable_goods_list_box').find('li').attr("data-ratio",reserve_ratio);
            }
        }
    }
    
}
