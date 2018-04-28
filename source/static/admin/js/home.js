var chart_data=null, width = 0,page=0,finished=false,nomore=false;
var cur_date = '';
var cur_tab_index = $.getUrlParam('tab');
var myscroll = null;
var myscroll_1 = null;
var myscroll_2 = null;
var all_goods_list = [];
var all_fruit_list = [];
var all_vegetables_list = [];
var is_pulldown_loading = 1;
var fruit_page = 1 , fruit_page_sum= 0;
var vege_page = 1 , vege_page_sum= 0;
var domain = window.location.href.split('//')[1].split('/')[0];

$(document).ready(function(){
    var wrapper_height = $(window).height()-152;
    $('#wrapper').css("height",wrapper_height-46+"px");
    $('#wrapper1').css("height",wrapper_height+"px");
    $('#wrapper2').css("height",wrapper_height-46+"px");
    $('.shop_list_ul').css("min-height",wrapper_height+"px");
    initIscroll();
    cur_date = getCurDate();  //初始化当前时间
    if(cur_tab_index == 0){    // 刷新页面时加载当前tab对应的数据
        getCurDate();
        getShopList(cur_date);
        getWeatherByDay(cur_date);
    }else if(cur_tab_index == 1){
        getGoodsList(1,0);
        getGoodsForSearch(3);
    }else if(cur_tab_index ==2){
        getMemberList();
    }else{
        if(!$('.user_phone').text()){
            getCurUserInfo();     // 获取个人中心数据
        }
    }
    setTimeout(function(){
        cookie.setCookie("user_type","admin");
        try{
            newWebSocket();
        }catch(e){

        }
    },5000);
    var tab= $.getUrlParam("tab")||0;
    $(".bm_tab_list>li").removeClass("active").eq(tab).addClass("active");
    $(".page_item").addClass("hide").eq(tab).removeClass("hide");
}).on("click",".data_lite_tab_list>li",function(){//按月-日
    var index = $(this).index();
    $(".data_lite_tab_list>li").removeClass("active").eq(index).addClass("active");
    getChartData();
    getGoodsData();
}).on("click",".bm_tab_list>li",function(){//底部tab
    var index = $(this).index();
    $(".bm_tab_list>li").removeClass("active").eq(index).addClass("active");
    $(".page_item").addClass("hide").eq(index).removeClass("hide");
    if(index==0){
        getCurDate();
        if($('.shop_list_ul').find('li').length <= 0){
            getShopList(cur_date);
        }
        history.replaceState(null, "华中果蔬助手", "/admin/shopmanage?tab="+index);
    }else if(index==1){
        if($('.fruit_goods_list_box').find('li').length==0){
            getGoodsList(1,0);
        }
        if(all_goods_list.length<=0){
            getGoodsForSearch(3);
        }
        history.replaceState(null, "华中果蔬助手", "/admin/shopmanage?tab="+index);
    }else if(index==2){//员工
        if($('.member_manage_ul').find('li').length<=0){
            getMemberList();
        }
        history.replaceState(null, "华中果蔬助手", "/admin/shopmanage?tab="+index);
    }else if(index==3){
        if(!$('.user_phone').text()){
            getCurUserInfo();     // 获取个人中心数据
        }
        history.replaceState(null, "华中果蔬助手", "/admin/shopmanage?tab="+index);
    }
}).on("click",".switch_shop",function(){
    $(".pop-switch-shop").removeClass("hide");
}).on("click",".more_shop_list>.item",function(){
    var id = $(this).attr("data-id");
    switchShop(id);
}).on('click', '.switch_type span', function() {
    _page = 0;
    var $this = $(this);
    var type = parseInt($(this).attr("data-type"));
    if($this.hasClass('active')){
        return false;
    }
    // $('.goods_list_box').attr("data-type",type);
    $('.switch_type').find('span').removeClass('active');
    $this.addClass('active');
    if(type == 1){
        $('#wrapper').removeClass('hide');
        $('#wrapper2').addClass('hide');
        if($('.fruit_goods_list_box').find('li').length == 0){
            getGoodsList(type,0);
        }
    }else{
        $('#wrapper').addClass('hide');
        $('#wrapper2').removeClass('hide');
        if($('.vegetable_goods_list_box').find('li').length == 0){
            getGoodsList(type,0);
        }
    }

}).on('click', '.goods_scan', function() {
    scanQRCode();
}).on('click', '.search_input', function() {
    $('.pop-search-box').removeClass('hide');
    $('#search_input_value').focus();
}).on('click', '.backhide', function() {
    $('.pop-search-box').addClass('hide');
    $('.pop-add-member').addClass('hide');
}).on('click', '.predict-coefficient-box', function() {
    $('.modify-coefficient').addClass('modify-coefficient-active')
    $("#keyboard").removeClass('hide');
}).on("click",".close_keyb",function(){
    $(this).closest('.pop-bwin').addClass('hide');
}).on('click', '.entering-item', function() {  //录入页js开始处
    var $this = $(this);
    if($this.hasClass('entering-item-active')){
        return false;
    }
    $('.entering-item').removeClass('entering-item-active');
    $this.addClass('entering-item-active');
}).on('click', '.next_entering_item', function() {
    // var cur_active = $('.entering-item-active');
    // var index = $('.entering_item').index(cur_active);
    // $('.entering-item').removeClass('entering-item-active');
    // var next_index = index+1;
    // if(index==5){
    //     next_index = 0;
    // }
    // $('.entering_item').eq(next_index).addClass('entering-item-active');
}).on('click', '.entering_item', function() {
    autoWriteIn();
}).on('click', '.set_mcalendar', function() {
    var cur_select_date = $('.choose_date').val();
    if(CompareDate(cur_select_date,cur_date)){
        return Tip('请选择'+cur_date+'之前的日期');
    }
    $('.wrap-loading-box').removeClass('hide')
    setTimeout(function(){
        getShopList(cur_select_date);
        getWeatherByDay(cur_select_date);
    },500)
}).on('click', '.add_member_btn', function() {
    $('.search_member_id').val('');
    $('.search_member_id').addClass('modify-coefficient-active');
    $(".add_member_box").removeClass('hide');
    actionIn(".pop-keyboard-content",'fadeInUp',0.3,"ease");
}).on('click', '.add_goods', function() {
    window.location.href = '/admin/goodsmanage?action=add_goods';
}).on('click', '.staff_list_item', function() {
    var cur_staff_id = $(this).attr("data-id");
    var type = $(this).attr("data-type");
    if(type == 1){
        return Tip('无法编辑超级管理员')
    }
    window.location.href = '/admin/staffmanage?action=edit_staff&id='+cur_staff_id;
}).on('click', '.goods_list_box li', function() {
    var id = parseInt($(this).attr("data-id"));
    var title_content = $(this).find('.name').text()+'('+$(this).find('.unit').text()+')';
    $('.cur_select_goods_info').text(title_content);
    $('.view_goods_detail').attr('data-id',id);
    $('.edit_goods_info').attr('data-id',id);
    $('.pop_select_operate').removeClass('hide');
}).on('click', '.edit_goods_info', function() {
    var id = parseInt($(this).attr("data-id"));
    window.location.href = '/admin/goodsmanage?action=edit_goods&goods_id='+id;
}).on('click', '.view_goods_detail', function() {
    var id = parseInt($(this).attr("data-id"));
    window.location.href = '/common/goodsdetail?action=get_details&goods_id='+id;
}).on('click', '.shop_list_ul li', function() {
    var id = parseInt($(this).attr("data-id"));
    window.location.href = '/admin/shopmanage?action=get_shop_demand&shop_id='+id;
}).on('click', '.search_goods_list_box li', function(event) {
    var id = parseInt($(this).attr("data-id"));
    var title_content = $(this).find('.name').text()+'('+$(this).find('.unit').text()+')';
    $('.cur_select_goods_info').text(title_content);
    $('.view_goods_detail').attr('data-id',id);
    $('.edit_goods_info').attr('data-id',id);
    $('.pop_select_operate').removeClass('hide');
}).on('click', '.go_to_admin', function() {
    enterInto('recorder');
}).on('click', '.send_statement', function() {
    $('.send_statement_input').val('').focus();
    $(".pop_send_statement").removeClass('hide');
    $('.send_statement_input').focus();
}).on('click', '.sure_send_btn', function() {
    var $this = $(this);
    var address = $(".send_statement_input").val();
    sendStatement($this,address)
}).on('click', '.set-coefficient', function() {
    window.location.href = '/admin/goodsmanage?action=reserve_ratio';
}).on('click', '.go_search_goods', function() {   // 点击搜索框时加载商品数据存储到本地
    // getGoodsForSearch(3);
}).on('click', '.check_update', function() {   // 点击搜索框时加载商品数据存储到本地
    window.NativeApi.checkUpdate();
})



// 发送报表
function sendStatement($obj, address){
    if($obj.hasClass("forbit")){
        return false;
    }
    var url = "/admin/shopmanage";
    var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if(!address || !reg.test(address)){
        return Tip("请输入正确的邮箱账号")
    }
    var args = {
        action: 'export_goods_and_email',
        email_address: address
    }
    $obj.addClass('forbit');
    $.postJson(url, args, function(res){
        $obj.removeClass('forbit');
        if(res.success){
            Tip("成功发送报表");
            $(".pop_send_statement").addClass('hide');
        }else{
            Tip(res.error_text);
        }
    })
}

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

// 监听录入项的前三项，完成预定量的自动添加
function autoWriteIn(){
    var item_1 = parseFloat($('.loss_val').val());
    var item_2 = parseFloat($('.yesterday_sales').val());
    var item_3 = parseFloat($('.cur_inventory').val());
    var cur_coefficient = parseFloat($('#predict_coefficient_val').val());
    var tomorrow_reserve_val = 0;
    if(item_1 && item_2 && item_3){
        tomorrow_reserve_val = parseFloat((item_1 + item_2)*cur_coefficient - item_3);
        tomorrow_reserve_val = tomorrow_reserve_val.toFixed(2);
        if(tomorrow_reserve_val <= 0) {
            tomorrow_reserve_val = 0;
        }
        $("#tomorrow_reserve_val").val(tomorrow_reserve_val);
    }
}

//得到当前的日期
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

//调用android扫描订单
function scanQRCode(){
    if(navigator.userAgent.indexOf("senguo:cashierapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbillapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbossapp")>=0){
        try{
            window.Assistant.scanQrString("scanQRCodeBack");
        }catch(e){
            Tip("当前APP版本过低，请前往个人中心更新");
        }
    }
}
function scanQRCodeBack(code){
    if (code) {
        var url = "/salersman/pick/"+code;
        window.open(url);
    }else{
        Tip("扫码失败，请重新扫码");
    }
}

// 初始化iscroll
var wrapper_scroll_height = 0;
function initIscroll(){
    myscroll = new iScroll("wrapper",{
        hScroll: false,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false,
        onScrollMove:function(){
            if (this.y < this.maxScrollY + 60) {
                var len = $('.fruit_goods_list_box').find('li').length;
                if(is_pulldown_loading == 1 && len < all_fruit_list.length){
                    is_pulldown_loading == 0;
                    var aime_goods_list = all_fruit_list.slice(len,len+10);
                    var res = {
                        all_goods: aime_goods_list
                    }
                    var render = template.compile(goods_item);
                    var html = render(res);
                    $('.fruit_goods_list_box').append(html);
                    myscroll.refresh();
                    is_pulldown_loading == 1;
                }
            }
        }
    })

    myscroll_2 = new iScroll("wrapper2",{
        hScroll: false,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false,
        onScrollMove:function(){
            if (this.y < this.maxScrollY + 60) {
                var len = $('.vegetable_goods_list_box').find('li').length;
                if(is_pulldown_loading == 1 && len < all_vegetables_list.length){
                    is_pulldown_loading == 0;
                    var aime_goods_list = all_vegetables_list.slice(len,len+10);
                    var res = {
                        all_goods: aime_goods_list
                    }
                    var render = template.compile(goods_item);
                    var html = render(res);
                    $('.vegetable_goods_list_box').append(html);
                    myscroll_2.refresh();
                    is_pulldown_loading == 1;
                }
            }
        }
    })

    myscroll_1 = new iScroll("wrapper1",{
        hScroll: false,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false,
        onScrollMove:function(){
            if (this.y > 40) {
                $('.pull-down-refresh').removeClass('hide');
            }
        },
        onScrollEnd:function(){
            if(!$('.pull-down-refresh').hasClass('hide')){
                var temp = $('.choose_date').val();
                setTimeout(function(){
                    getShopList(temp);
                    $('.pull-down-refresh').addClass('hide');
                },600)
            }
        }
    })
}

// 获取商品列表
var goods_item = '{{each all_goods as data}}'+
                '<li class="clip group grey_btn" data-id="{{data["id"]}}">'+
                    '<div class="pull-left goods-name-box">'+
                        '<p class="name">{{data["goods_name"]}}</p>'+
                        '<span>单品编号：{{data["goods_code"]}}</span>'+
                        '<span class="ml10 unit">单位：{{data["unit"]}}</span>'+
                    '</div>'+
                    '<div class="pull-right order-goods goods_update_count_{{data["id"]}} {{if data["demand_count"] > 0 }}has_submit{{else}}no_submit{{/if}}" data-num="{{data["demand_count"]}}">{{if data["demand_count"] > 0}}今日订货：{{data["demand_count"]}}{{else}}今日无订货{{/if}}</div>'+
                '</li>'+
           '{{/each}}';
function getGoodsList(type,page){
    is_pulldown_loading = 0;
    var url = '/admin/goodsmanage';
    var args = {
        action: 'get_all_goods',
        classify: type,
        page: page
    }
    if(type==1){
        var $list = $('.fruit_goods_list_box');
    }else{
        var $list = $('.vegetable_goods_list_box');
    }
    // $('.wrap-loading-box').removeClass('hide');
    $.postJson(url, args, function(res){
        if(res.success){
            // $list.empty();
            var all_goods = res.all_goods;
            $('.list').find('no_result').remove();
            if(all_goods.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                $list.empty();
                $list.append(str);
            }else{
                var render = template.compile(goods_item);
                var html = render(res);
                $list.append(html);
            }
            if(type == 1){
                fruit_page_sum = res.total_page;
                setTimeout(function(){
                    myscroll.refresh()
                    is_pulldown_loading = 1;
                },500)
            }
            if(type == 2){
                vege_page_sum = res.total_page;
                setTimeout(function(){
                    myscroll_2.refresh()
                    is_pulldown_loading = 1;
                },500)
            }
            $('.wrap-loading-box').addClass('hide');
        }else{
            is_pulldown_loading = 1;
            $('.wrap-loading-box').addClass('hide');
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

// 获取所有商品的信息，本地查询使用
function getGoodsForSearch(type){
    var url = '/admin/goodsmanage';
    var args = {
        action: 'get_all_goods',
        classify: type
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var all_goods = res.all_goods;
            all_goods_list = [];
            for(var key in all_goods){
                all_goods_list.push(all_goods[key]);
            }
            for(var i=0;i<all_goods_list.length;i++){
                if(all_goods_list[i].classify == 1){
                    all_fruit_list.push(all_goods_list[i]);
                } else if(all_goods_list[i].classify == 2){
                    all_vegetables_list.push(all_goods_list[i]);
                }
            }
            toPinyin();
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

// 获取店铺列表
function getShopList(date){
    var url = '/admin/shopmanage';
    var args = {
        action: 'get_all_shops',
        date: date
    }
    var $list = $('.shop_list_ul');
    $.postJson(url, args, function(res){
        if(res.success){
            $list.empty();
            var data_list = res.data_list;
            var temp = '{{each data_list as data}}'+
                            '<li class="grey_btn shop_id_{{data["id"]}}" data-id="{{data["id"]}}">'+
                                '<div class="shop-img-box pull-left">'+
                                    '<img alt src="{{if data["shop_trademark_url"] }}{{data["shop_trademark_url"]}}{{else}}../../static/images/shop_picture.png{{/if}}">'+
                                '</div>'+
                                '<div class="shop-name-box pull-left">'+
                                    '<p>{{data["shop_name"]}}</p>'+
                                    '<span>水果<span class="has_submit fruit_update_num">{{if data["sum_fruit"]>0 }}{{data["sum_fruit"]}}{{else}}{{/if}}</span><span class="slash_symbol {{if data["sum_fruit"]==0}}hide{{/if}}">/</span>{{data["fruit_count"]}}种</span>'+
                                    '<span class="ml10">蔬菜<span class="has_submit vege_update_num">{{if data["sum_vegetables"]>0 }}{{data["sum_vegetables"]}}{{else}}{{/if}}</span><span class="slash_symbol {{if data["sum_vegetables"]==0}}hide{{/if}}">/</span>{{data["vegetables_count"]}}种</span>'+
                                '</div>'+
                                '<div class="submit-num shop_update_count pull-right {{if data["demand_count"]==0 }}no_submit{{/if}}" data-num="{{data["demand_count"]}}">{{if data["demand_count"] >0}}{{else}}今日暂无更新{{/if}}</div>'+
                            '</li>'+
                       '{{/each}}';
            if(data_list.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                $list.append(str);
            }else{
                var render = template.compile(temp);
                var html = render(res);
                $list.append(html);
            }
            myscroll_1.refresh();
            $(".wrap-loading-box").addClass("hide");
        }else{
            $(".wrap-loading-box").addClass("hide");
            return Tip(res.error_text);
        }
    }
    ,function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    })
}

// 获取员工列表
function getMemberList(){
    var url = '/admin/staffmanage';
    var args = {
        action: 'get_all_staff'
    }
    var $list = $('.member_manage_ul');
    $.postJson(url,args ,function(res){
        if(res.success){
            $list.empty();
            var data_list = res.data_list;
            var temp = '{{each data_list as data}}'+
                            '<li class="grey_btn group staff_list_item" data-id="{{data["staff_id"]}}" data-type="{{if data["active_admin"]}}1{{else}}0{{/if}}">'+
                                '<div class="shop-member-img-box">'+
                                    '<img alt src="{{if data["headimgurl"] }}{{data["headimgurl"]}}{{else}}../../static/common/img/person.png{{/if}}">'+
                                '</div>'+
                                '<div class="member-main-info group">'+
                                    '<div class="name-and-phone group">'+
                                        '<span class="member-name clip">{{data["realname"]}}</span>'+
                                        '<span class="c666">{{data["phone"]}}</span>'+
                                    '</div>'+
                                    '<div class="role-play-box">'+
                                        '{{if data["active_admin"]}}<span class="super-admin mr10">超级管理员</span>{{/if}}'+
                                        '{{if data["active_recorder"]}}<span class="recorder">录入员</span>{{/if}}'+
                                        '{{if data["remarks"]}}<span class="remarks ml20">备注：{{data["remarks"]}}</span>{{/if}}'+
                                    '</div>'+
                                '</div>'+
                            '</li>'+
                       '{{/each}}';
            if(data_list.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                $list.append(str);
            }else{
                var render = template.compile(temp);
                var html = render(res);
                $list.append(html);
            }
        }else{
            return Tip(res.error_text);
        }
    })
}

// 根据id or phone搜索用户
function getUserInfo(val) {
    var url = '/admin/staffmanage';
    var args = {
        action: 'get_user',
        phone_or_id: val
    }
    $.postJson(url,args ,function(res){
        if(res.success){
            var account_info = res.account_info;
            var id = account_info.id;
            window.location.href = '/admin/staffmanage?action=add_staff&id='+id;
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
        }
    })
}

// 按天获取天气信息
function getWeatherByDay(date){
    var url = '/admin/shopmanage';
    var args = {
        action: 'get_weather_by_date',
        date: date
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data = res.weather_dict;
            var str = data.weekday+'，'+data.weather+'，'+data.low_temperature+'~'+data.high_temperature+'℃';
            $('.record_weather_span').text(str);
            $('.record_holiday_span').text(data.holiday);
        }else{
            return Tip(res.error_text);
        }
    })
}

// websocket连接
var websocket_connected_count = 0;
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
        heartCheck.reset().start();   // 成功建立连接后，重置心跳检测
        // Tip("connected successfully")
    }
    // 连接发生错误，连接错误时会继续尝试发起连接（尝试5次）
    websocket.onerror = function() {
        // console.log("onerror连接发生错误")
        websocket_connected_count++;
        if(websocket_connected_count <= 5){
            newWebSocket()
        }
    }
    // 接受到消息的回调方法
    websocket.onmessage = function(e){
        // console.log("接受到消息了")
        heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
        var message = e.data;
        if(message){
            message = $.parseJSON(message);
            var goods_id = parseInt(message.goods_id);
            var type = parseInt(message.classify);
            refreshView(message);
        }
    }

    // 接受到服务端关闭连接时的回调方法
    websocket.onclose = function(){
        // Tip("onclose断开连接");
    }
    // 监听窗口事件，当窗口关闭时，主动断开websocket连接，防止连接没断开就关闭窗口，server端报错
    window.onbeforeunload = function(){
        websocket.close();
    }

    // 心跳检测, 每隔一段时间检测连接状态，如果处于连接中，就向server端主动发送消息，来重置server端与客户端的最大连接时间，如果已经断开了，发起重连。
    var heartCheck = {
        timeout: 55000,        // 9分钟发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
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

// 收到server端需要更新信号时，刷新视图，店铺和货品两个tab
function refreshView(obj){
    var shop_id = parseInt(obj.shop_id);
    var goods_id = parseInt(obj.goods_id);
    var type = parseInt(obj.classify);
    var goods_add = obj.goods_add;

    // 店铺处的tab页视图更新
    var $obj = $(".shop_id_"+shop_id)
    if(goods_add){
        if(type == 1){
            var $update_obj = $obj.find('.fruit_update_num');
            var fruit_num = parseInt($update_obj.text());
            if(fruit_num){
                fruit_num++;
            }else{
                fruit_num = 1;
            }
            $update_obj.text(fruit_num)
        }else if(type == 2){
            var $update_obj = $obj.find('.vege_update_num');
            var vege_num = parseInt($update_obj.text());
            if(vege_num){
                vege_num++;
            }else{
                vege_num = 1;
            }
            $update_obj.text(vege_num)
        }
        $obj.find('.slash_symbol').removeClass('hide');
        $obj.find('.shop_update_count').addClass('hide')
    }

    // 货品处的视图更新，分页数据实时更新，更新步骤如下
    // 1. 更新数据，首先判断是何种类型数据
    var is_what_goods = null;
    if(type == 1){
        is_what_goods = all_fruit_list;
    }else if(type == 2){
        is_what_goods = all_vegetables_list;
    }
    // 2. 找到该类型下对应的商品，执行demand_count++
    for(var i=0;i<is_what_goods.length;i++){
        if(is_what_goods[i].id == goods_id){
            is_what_goods[i].demand_count = is_what_goods[i].demand_count+1;
            break;
        }
    }
    // 3. 将此时更新的商品对应类型的总数据进行倒序排序
    is_what_goods.sort(function(a,b){
        return b.demand_count - a.demand_count;
    })
    // 4. 从更新后的总数据中拿数据去做视图的更新，清空之前的视图，根据记录的视图中li的数量去渲染相同数量的li
    if(type==1){
        var len = $('.fruit_goods_list_box').find('li').length;
        var aime_goods_list = all_fruit_list.slice(0,len);
        var res = {
            all_goods: aime_goods_list
        }
        var render = template.compile(goods_item);
        var html = render(res);
        $('.fruit_goods_list_box').empty().append(html);
        myscroll.refresh();
    }
    if(type == 2 && $('.vegetable_goods_list_box').find('li').length>0){
        var len = $('.vegetable_goods_list_box').find('li').length;
        var aime_goods_list = all_vegetables_list.slice(0,len);
        var res = {
            all_goods: aime_goods_list
        }
        var render = template.compile(goods_item);
        var html = render(res);
        $('.vegetable_goods_list_box').empty().append(html);
        myscroll_2.refresh();
    }

}