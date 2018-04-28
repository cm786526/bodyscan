var chart_data=null, width = 0,page=0,finished=false,nomore=false,days=1,cur_item=null,
printUrl="/printerset",goodsUrl="/salersman/goodsmanage",all_goods_list=[],page_status=1;
var liswiper = null;
$(document).ready(function(){
    // 判断是否为老板助手，如果是进行以下的操作
    if(navigator.userAgent.indexOf("senguo:pfbossapp")>=0){
        if($.getUrlParam("tab")==0){
            document.title = "无线打印机设置";
            $(".container").removeClass("pt0").addClass("pt40");
            $("#print_header").removeClass("hide");
        }else{
            $(".goods_cookie").addClass("hide");
            $(".enter_kp_btn").removeClass("hide").css("bottom","30px");
            $(".fix_manage_div").css("bottom","30px");
        }
        $(".bm_nav").addClass("hide");
    }
    if(!PERMISSION_LIST_STATUS.addgoods){//无添加商品权限
        $(".goods_add").addClass("no_permission");
    }
    if(!PERMISSION_LIST_STATUS.editgoods){//无编辑商品权限
        $(".edit_goods").addClass("forbid-opacity");
    }
    page_status = $.getUrlParam("status") || 1;
    if(page_status==2){//设置模式
        setTimeout(function(){
            goodsSetBtn();
        },300);
    }
    var wHeight = $(window).height()-330;
    $(".data_sale_data_box").css("minHeight",wHeight+"px");
    setGroupList();//根据商品分组获取商品列表
    getChartData(1);
    getGoodsData(1);
    getPrinters();
    if($("#multi_sale_goods").val()==1&&navigator.userAgent.indexOf("senguo:pfbossapp")<0){
        if(window.localStorage && (window.localStorage.getItem("localOrder")!="{}" && window.localStorage.getItem("localOrder")!=null)){
            var localorder = JSON.parse(localStorage.getItem("localOrder"));
            var length = getJSONLength(localorder);
            $(".goods_cookie").children("span").text(length);
            $(".goods_cookie").removeClass("hide");
        }
    }else{
        $(".goods_cookie").addClass("hide");
        window.localStorage && window.localStorage.removeItem("ifOneOrder");
        window.localStorage && window.localStorage.removeItem("localOrder");
    }
    if($.getUrlParam("tab")==3){
        $(".pop-system-conform").removeClass("hide");
    }
    $(".search_click_text").text("点击开票");
    $(".search_result_list").addClass("goods-list-ul group").removeClass("search-result-list");  //初始化搜索样式
    if($(".all_groupgoods_div").hasClass("no-showimg")){
        $(".search_result_list").addClass("no-showimg");
    }
    $(".wrap-search-result").addClass("padd0");
    getShopList();
}).on("click",".goods_data_types .gitem",function(){
    var index = $(this).index();
    var id = $(this).attr("data-id");
    $(".goods_data_types>li").removeClass("active").eq(index).addClass("active");
    getChartData(id);
    getGoodsData(id);
}).on("click",".bm_tab_list>li",function(){
    if(!window.localStorage){//如果不支持localStorage,提示更新版本
        $(".pop-version").removeClass("hide");
        return false;
    }
    var index = $(this).index();
    $(".bm_tab_list>li").removeClass("active").eq(index).addClass("active");
    $(".page_item").addClass("hide").eq(index).removeClass("hide");
    if(index==1){
        initLineEcharts(chart_data);
    }
    if(index==3){
        $(".pop-system-conform").removeClass("hide");
    }
    replaceUrl("tab",index);
}).on("touchstart",".fix_manage_div>a",function(){
    $(this).addClass("goods-a-hover");
}).on("touchend",".fix_manage_div>a",function(){
    $(this).removeClass("goods-a-hover");
}).on("click",".goods_set",function(){//进入设置模式
    goodsSetBtn();
}).on("click",".cancel_btn,.finish_btn",function(){
    $(".goods_list").removeClass("goods-list-set-ul");
    $(".fix_manage_div,.bm_nav").removeClass("hide");
    $(".bm_btns_nav,.goods_add").addClass("hide");
    $(".goods-list-top-box").removeClass("goodslist-set-type");
    if(navigator.userAgent.indexOf("senguo:pfbossapp")>=0){
        $(".goods_cookie").addClass("hide");
        $(".enter_kp_btn").removeClass("hide");
        $(".bm_nav").addClass("hide");
    }
    $(".all_goods_hide").removeClass("hide");
    $(".wrap-group-search").removeClass("hide");
    var padding_top = $(".page-goods .fixnav").height();
    $(".page-goods .wrap-goods-list").css("padding-top",padding_top+8);
    replaceUrl("status",1);
}).on("click",".goods-list-set-ul>li",function(){//设置
    initGoodsSet($(this));
}).on("click",".down_goods",function(){//改变上下架
    editGoodsStatus($(this));
}).on("click",".edit_goods",function(e){//进入编辑
    if($(this).hasClass("forbid-opacity")){
        return Tip("您暂无编辑货品权限");
    }
    var goods_id = cur_item.attr("data-id");
    window.location.href="/salersman/goods?goods_id="+goods_id;
}).on("click",".top_goods",function(){//置顶
    editGoodsTop($(this));
}).on("click",".no_see_goods",function(){//是否首页可见
    editGoodsShow($(this));
}).on("click",".goods_list>li",function(e){//进入开票
    if(!$(this).closest(".goods_list").hasClass("goods-list-set-ul")){
        if(window.localStorage){
            localStorage.removeItem("kp_supplier_id");
        }
        textToAudioForAndroid($(this).find(".goods-name").text());
        window.location.href="/salersman/goodsSale/"+$(this).closest("li").attr("data-id");
    }
}).on("click",".add_print_btn",function(){//添加打印机
    $(".print_num,.print_key,.print_remark").val("");
    $(".pop-addprint").removeClass("hide");
    $(".print_num").focus();
    $(".select_print_types>.item").removeClass("active").eq(0).addClass("active");
    $(".wrap_print_key").removeClass("hide");
}).on("click",".select_print_types>.item",function(){//选择打印机类型
    var $this=$(this);
    var type=$this.attr("data-id");
    $this.addClass("active").siblings(".item").removeClass("active");
    if(type == 3){ //森果打印机
        $(".wrap_print_key").addClass("hide");
    }else{
        $(".wrap_print_key").removeClass("hide");
    }
}).on("click",".add_finish_btn",function(){
    addPrinter($(this));
}).on("click",".allot_print",function(){//分配打印机
    cur_item = $(this).closest(".print_item");
    getAllotStaff($(this));
}).on("click",".allot_printer_btn",function(){//分配打印机
    allotPrinter($(this));
}).on("click",".test_print",function(){//测试打印机
    cur_item = $(this).closest(".print_item");
    testPrinter($(this));
}).on("click",".note_print",function(){//备注打印机
    cur_item = $(this).closest(".print_item");
    $(".pop-note").removeClass("hide");
    $(".print_note").val(cur_item.find(".remark_span").text()).focus();
}).on("click",".note_printer_btn",function(){//备注打印机
    notePrinter($(this));
}).on("click",".del_print",function(){//删除打印机
    cur_item = $(this).closest(".print_item");
    $(".pop-delprint").removeClass("hide");
}).on("click",".del_printer_btn",function(){//删除打印机
    delPrinter($(this));
}).on("click","#print_staff_list>li",function(){
    $(this).toggleClass("active");
}).on("click","#go_profile",function(){
    window.location.href="/personalcenter";
}).on("click",".goods_scan",function(){
    scanQRCode();
}).on("click",".ok_person_center",function(){
    $(".pop-system-conform").addClass("hide");
    var index = 3;
    $(".bm_tab_list>li").removeClass("active").eq(index).addClass("active");
    $(".page_item").addClass("hide").eq(index).removeClass("hide");
    replaceUrl("tab",index);
}).on("click",".goods_add",function(e){
    if($(this).hasClass("no_permission")){
        Tip("您暂无添加货品权限");
        e.preventDefault();
    }
}).on("click",".search_result_list>li",function(e){//进入开票
    window.location.href="/salersman/goodsSale/"+$(this).closest("li").attr("data-id");
}).on("click",".set_print_btn",function(){//打印机总设置
    printSet();
}).on("click",".switch_shop",function(){
    if($(".i-more-shop").hasClass("hide")){
        return false;
    }
    $(".pop-switch-shop").removeClass("hide");
}).on("click",".more_shop_list>.item",function(){
    var id = $(this).attr("data-id");
    switchShop(id);
}).on("click",".goods_group_list>li",function(){
    $(".goods_group_list li").removeClass("active");
    var indexNum = $(this).addClass("active").index();
    liswiper.slideTo(indexNum,300,true);
});
function goodsSetBtn(){
    $(".goods_list").addClass("goods-list-set-ul");
    $(".fix_manage_div,.bm_nav").addClass("hide");
    $(".bm_btns_nav,.goods_add").removeClass("hide");
    $(".goods-list-top-box").addClass("goodslist-set-type");
    $(".all_goods_hide").addClass("hide");
    if ($(".goods_group_list>.item").size() <= 1) { //只有一个分组时
        $(".wrap-group-search").addClass("hide");
    }
    var padding_top = $(".page-goods .fixnav").height();
    $(".page-goods .wrap-goods-list").css("padding-top",padding_top+8);
    replaceUrl("status",2);
}
//初始化设置商品
function initGoodsSet($obj){
    cur_item = $obj;
    if(cur_item.find(".goods-in-type").hasClass("green-type")){
        $(".goods_in_type").addClass("green-type").text("代卖");
    }else{
        $(".goods_in_type").removeClass("green-type").text("自营");
    }
    $(".goods_operate_name").text(cur_item.find(".goods-name").text());
    $(".goods_supply_name").text(cur_item.find(".supply_name").text());
    if(cur_item.hasClass("top-item")){
        $(".top_goods").find(".pt_txt").addClass("red-txt").text("取消置顶");
    }else{
        $(".top_goods").find(".pt_txt").removeClass("red-txt").text("置顶");
    }
    if(cur_item.hasClass("not-see")){
        $(".no_see_goods").find(".pt_txt").removeClass("red-txt").text("显示在主页");
    }else{
        $(".no_see_goods").find(".pt_txt").addClass("red-txt").text("不显示在主页");
    }
    $(".pop-goods-operate").removeClass("hide");
}
//根据分组请求商品列表
function setGroupList(){
    var $groupList = $(".goods_group_list>.item");
    var group_count = $groupList.size(); //分组数
    var width = 0;
    $groupList.each(function(index){
        var id = $(this).attr("data-id");
        var group_swiper = '<div class="swiper-slide item">'+
            '                    <ul class="goods-list-ul group goods_list goods_list_'+id+'"></ul>'+
            '                </div>';
        $("#swiper_box").append(group_swiper);
        width += ($(this).width() + 16);
        if(index==0){
            $(this).addClass("active");
        }
        getAllGoods(id);
    });
    if(group_count>1) { //有多个分组
        $(".flag-goods-search").remove();
        $(".i-goods-search").removeClass("hide");
        $(".wrap-goods-group").removeClass("hide");
        //初始化swiper
        liswiper = new Swiper('#group_list_box', {
            mode: 'horizontal',
            grabCursor: true,
            resistance: "100%",
            autoplayDisableOnInteraction: false,
            onSlideChangeEnd: slideCallBack
        });
        $(".swiper-slide").css("minHeight", $(window).height() - 190);
        //初始化导航条宽度
        if(width>$(".wrap-goods-group").width()){
            $(".goods_group_list").css("width", width + "px");
        }
        //url有group
        var group_id = $.getUrlParam("group");
        if (group_id) {
            var group_index = $(".goods_group_list>.item[data-id='" + group_id + "']").index();
            if (group_index > 0) {
                $(".goods_group_list>.item").removeClass("active");
                $(".goods_group_list>.item[data-id='" + group_id + "']").addClass("active");
                liswiper.slideTo(group_index, 500, true);
            }
        }
    }else{
        $(".flag-goods-search").removeClass("hide");
        $(".i-goods-search").remove();
        $(".wrap-goods-group").addClass("hide");
        if(page_status == 2){ //设置模式
            $(".wrap-group-search").addClass("hide");
        }
    }
}
var print_item = '{{each printer_list as print}}'+
                '<li class="print_item" data-id="{{print.id}}">'+
                    '<div class="pitem-row-top">'+
                        '<p class="pitem-row-title clip f20"><span class="remark_span">{{print.remark || "无备注"}}</span></p>'+
                        '<p class="f16">{{print.brand}}打印机编号：{{print.num}}</p>'+
                        '<p class="print-mans">已分配{{print.assign_staff_num}}人<span class="man_maohao {{if print.assign_staff_users==""}}hide{{/if}}">：</span><span class="man_span">{{print.assign_staff_users}}</span></p>'+
                    '</div>'+
                    '<ul class="pitem-btns-list group">'+
                        '<li class="allot_print">分配</li>'+
                        '<li class="test_print">打印测试</li>'+
                        '<li class="note_print grey_btn">备注</li>'+
                        '<li class="cred del_print grey_btn">删除</li>'+
                    '</ul>'+
                '</li>'+
                '{{/each}}';
var goods_item = '{{each goods_list as goods}}'+
                '<li data-id="{{goods.id}}" class="goods-item {{ if goods.top }}top-item{{/if}} {{ if goods.hide }}not-see{{/if}}">'+
                    '<div class="goods-item-div grey_btn {{ if goods.top }}goods-item-stick{{/if}}">'+
                        '<dl class="row-dl">'+
                            '<dd><img src="{{goods.img_url}}?imageView2/1/w/100/h/100" alt=""></dd>'+
                            '<dt>'+
                                '<p class="name c333 clip f20 goods-name">{{goods.name}}</p>'+
                                '<p class="name-attr mt8 overhidden">'+
                                    '<span class="c666 supply_name">{{goods.supplier_name || "无供应商"}}</span>'+
                                    '<span class="f12 goods-in-type {{ if goods.supply_type==""}}hide{{/if}} {{ if goods.supply_type_code==1}}green-type{{/if}}">{{goods.supply_type}}</span>'+
                                '</p>'+
                            '</dt>'+
                        '</dl>'+
                    '</div>'+
                '</li>'+
                '{{/each}}';
//获取打印机
function getPrinters(){
    var args = {
        action:"get_printer_list",
        scene:1
    };
    $.postJson(printUrl,args,function(res){
        $(".wrap-loading-box").addClass("hide");
        if(res.success){
            $(".print_counts").text(res.printer_count);
            var datalist = res.printer_list;
            $(".no_result").addClass("hide");
            $("#print_list").empty();
            if(datalist.length==0){
                return false;
            }else{
                var render = template.compile(print_item);
                var html = render(res);
                $("#print_list").append(html);
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
    });
}
//添加打印机
function addPrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var receipt_type = $(".select_print_types>.active").attr("data-id");
    var print_name = $.trim($(".select_print_types>.active .print_name").text());
    var wireless_print_num = $.trim($(".print_num").val());
    var wireless_print_key = $.trim($(".print_key").val());
    var remark = $.trim($(".print_remark").val());
    if(wireless_print_num==""){
        $(".print_num").focus();
        return Tip("打印机终端号不能为空");
    }
    if(receipt_type == 3){
        wireless_print_key = "";
    }else{
        if(wireless_print_key==""){
            $(".print_key").focus();
            return Tip("打印机终端密钥不能为空");
        }
    }
    if(remark==""){
        $(".print_remark").focus();
        return Tip("打印机备注不能为空");
    }
    var args = {
        action:"add_printer",
        receipt_type:receipt_type,
        wireless_print_num:wireless_print_num,
        wireless_print_key:wireless_print_key,
        remark:remark
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            var item = '<li class="print_item" data-id="'+res.printer_id+'">'+
                    '<div class="pitem-row-top">'+
                        '<p class="pitem-row-title clip f20"><span class="remark_span">'+remark+'</span></p>'+
                        '<p class="f16">'+print_name+'打印机编号：'+wireless_print_num+'</p>'+
                        '<p class="print-mans">已分配0人<span class="man_maohao hide">：</span><span class="man_span"></span></p>'+
                    '</div>'+
                    '<ul class="pitem-btns-list group">'+
                        '<li class="allot_print">分配</li>'+
                        '<li class="test_print">打印测试</li>'+
                        '<li class="note_print grey_btn">备注</li>'+
                        '<li class="cred del_print grey_btn">删除</li>'+
                    '</ul>'+
                '</li>';
            $("#print_list").append(item);
            $(".print_counts").text(parseInt($(".print_counts").text())+1);
            $(".pop-addprint").addClass("hide");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//删除打印机
function delPrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var print_id = cur_item.attr("data-id");
    var args = {
        action:"del_printer",
        printer_id:print_id
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            $(".pop-delprint").addClass("hide");
            cur_item.remove();
            cur_item=null;
            $(".print_counts").text(parseInt($(".print_counts").text())-1);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//备注打印机
function notePrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var print_id = cur_item.attr("data-id");
    var print_remark = $.trim($(".print_note").val());
    if(print_remark==""){
        $(".print_note").focus();
        return Tip("请勿添加空备注");
    }
    var args = {
        action:"remark",
        printer_id:print_id,
        remark:print_remark
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            $(".pop-note").addClass("hide");
            cur_item.find(".remark_span").text(print_remark).removeClass("hide");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//测试打印机
function testPrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var print_id = cur_item.attr("data-id");
    var args = {
        action:"try_print",
        printer_id:print_id
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            Tip("请注意查看打印机打印的出票");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//获取打印机可分配的人
function getAllotStaff($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var print_id = cur_item.attr("data-id");
    var args = {
        action:"assign",
        printer_id:print_id
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            var staff_list = res.staff_list;
            if(staff_list.length==0){
                Tip("暂时没有可供分配的对象");
                return false;
            }
            $("#print_staff_list").empty();
            var lis = "";
            for(var i=0; i<staff_list.length; i++){
                var staff = staff_list[i],if_active="",if_active_txt="";
                if(staff.if_assign==1){
                    if_active = "active";
                }else if(staff.if_assign==2){
                    if_active_txt = "<br><span class='cred f12'>该员工已分配</span>";
                }
                lis += '<li data-id="'+staff.staff_id+'" class="'+if_active+'">'+
                    '<p class="clip">'+
                        '<img class="printer-img" src="'+staff.staff_headimgurl+'" alt="头像">'+
                        '<span class="staff-span-txt">'+staff.staff_name+' '+staff.staff_phone+if_active_txt+'</span>'+
                        '<i class="i-check"></i>'+
                    '</p>'+
                '</li>';
            }
            $("#print_staff_list").append(lis);
            $(".pop-allot").removeClass("hide");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//分配打印机
function allotPrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    var print_id = cur_item.attr("data-id"),staff_ids=[];
    $("#print_staff_list>li").each(function(){
        if($(this).hasClass("active")){
            staff_ids.push($(this).attr("data-id"));
        }
    });
    var args = {
        action:"commit_assign",
        printer_id:print_id,
        staff_ids:staff_ids
    };
    $obj.addClass("forbid");
    $.postJson(printUrl,args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            $(".pop-allot").addClass("hide");
            $(".wrap-loading-box").removeClass("hide");
            getPrinters();
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//获取商品数据
function getAllGoods(group_id,ifRefresh){
    var args = {
        action:"goods_list",
        active:1,
        group:group_id,
        page:page
    };
    $.postJson(goodsUrl,args,function(res){
        if(res.success){
            var $goodslist = $(".goods_list_"+group_id);
            $(".goods_active_count").text(res.goods_active_count);
            var goods_list = res.goods_list;
            if(ifRefresh){
                $goodslist.empty();
            }
            if(goods_list.length==0){
                $goodslist.append('<p class="no-result">暂无商品</p>');
            }else{
                for(var key in goods_list){
                    all_goods_list.push(goods_list[key]);
                }
                var render = template.compile(goods_item);
                var html = render(res);
                $goodslist.append(html);
                if($goodslist.find(".goods-item").size() == $goodslist.find(".not-see").size()){
                    //分组内所有不显示在主页
                    $goodslist.append('<p class="txt-center f20 mt50 c999 all_goods_hide">已设置分组内所有货品<br/>不显示在主页</p>');
                }
                toPinyin();
                if(page_status == 2){//处于设置状态
                    $(".goods_list").addClass("goods-list-set-ul");
                    $(".all_goods_hide").addClass("hide");
                }else{
                    $(".goods_list").removeClass("goods-list-set-ul");
                    $(".all_goods_hide").removeClass("hide");
                }
            }
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//调整商品置顶
function editGoodsTop($obj){
    var active = 1;
    if(cur_item.hasClass("top-item")){
        active = 2;
    }
    var goods_id = cur_item.attr("data-id");
    var args = {
        action:"top",
        active:active,
        goods_id:goods_id
    };
    $.postJson(goodsUrl,args,function(res){
        if(res.success){
            var $li = cur_item;
            var $goodslist = $li.closest(".goods_list");
            var top_count = $goodslist.find(".top-item").size();
            $li.toggleClass("top-item");
            $li.find(".goods-item-div").toggleClass("goods-item-stick");
            var li_clone = $li.clone();
            if(active == 1){//置顶
                if(top_count==0){
                    $goodslist.find(".goods-item").eq(0).before(li_clone);
                }else{
                    $goodslist.find(".top-item").eq(top_count-1).after(li_clone);
                }
            }else{
                $goodslist.append(li_clone);
            }
            $li.remove();
            $(".pop-goods-operate").addClass("hide");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//调整商品首页显示
function editGoodsShow($obj){
    var active = 2;
    if(cur_item.hasClass("not-see")){
        active = 1;
    }
    var goods_id = cur_item.attr("data-id");
    var args = {
        action:"hide",
        active:active,
        goods_id:goods_id
    };
    $.postJson(goodsUrl,args,function(res){
        if(res.success){
            var $li = cur_item;
            $li.toggleClass("not-see");
            $(".pop-goods-operate").addClass("hide");
            var $goodslist = $li.closest(".goods_list");
            if($goodslist.find(".goods-item").size() == $goodslist.find(".not-see").size()){
                //分组内所有不显示在主页
                if($goodslist.find(".all_goods_hide").size() == 0){
                    $goodslist.append('<p class="txt-center f20 mt50 c999 all_goods_hide hide">已设置分组内所有货品<br/>不显示在主页</p>');
                }
            }else{
                $goodslist.find(".all_goods_hide").remove();
            }
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//商品上下架
function editGoodsStatus($obj){
    var active = 2;
    var goods_id = $obj.closest("li").attr("data-id");
    var args = {
        action:"edit_active",
        active:active,
        goods_id:goods_id
    };
    $.postJson(goodsUrl,args,function(res){
        if(res.success){
            if(active==2){
                $obj.text("上架");
            }else{
                $obj.addClass("下架");
            }
            $obj.closest("li").css("height",0);
            setTimeout(function(){
                $obj.closest("li").remove();
            },350);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
function getDate(days){
    var myDate = new Date(); //获取今天日期
    myDate.setDate(myDate.getDate() - days);
    var firstDate = myDate.getMonth()+1+"."+myDate.getDate();
    $(".week_day").text(firstDate);
}
function getGoodsData(type){
    var url = "";
    var args = {
        action:"get_statistic_list_data",
        date_type:type
    };
    $.postJson(url,args,function(res){
        if(res.success){
            var data = res.datalist;
            initGoodsData(data);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
function initGoodsData(data){
    var items = "";
    for(var i=0; i<data.length; i++){
        var chart = data[i];
        items += '<tr class="tr-total">'+
            '<td class="txt-al c333">'+chart.date+'</td>'+
            '<td class="txt-al c333 overhidden">'+chart.goods_name+'</td>'+
            '<td class="txt-ar c333">'+chart.total_weigh+'</td>'+
            '<td class="txt-ar c333">'+chart.total_commission_mul+'</td>'+
            '<td class="txt-ar c333">'+chart.total_money+'</td>'+
            '<td class="txt-ar c333">'+chart.total_commission+'</td>'+
            '</tr>';
    }
    $("#data_body").empty().append(items);
}
function getChartData(type){
    var url = "";
    var args = {
        action:"get_statistic_line_data",
        date_type:type
    };
    $.postJson(url,args,function(res){
        if(res.success){
            var data = res.datalist;
            chart_data = data;
            initLineEcharts(data);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
function initLineEcharts(data){
    var datax = [];
    var length = data.length;
    for(var i=0; i<length; i++){
        datax.push('');
    }
    var myChart_order = echarts.init(document.getElementById('chart_order'));
    myChart_order.setOption(initLineOption(data,datax),true);
}
function initLineOption(data,datax){
    var option = {
        tooltip: {
            type:'hideTip'
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '4%',
            top:'5%',
            containLabel: false
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: datax,
            splitLine:false,
            axisLine:false,
            axisTick:false
        },
        yAxis: {
            type: 'value',
            splitLine:false,
            axisLine:false,
            axisTick:false,
            axisLabel:{show:false}
        },
        color:['#efefef'],
        series: [
            {
                name:'数据',
                type:'line',
                stack: '总量',
                symbol:'circle',
                symbolSize:3,
                areaStyle: {normal: {shadowColor: 'rgba(0, 0, 0, 0.1)',opacity:0.2}},
                data:data
            }
        ]
    };
    return option;
}
function scrollLoading(){
    $(window).scroll(function(){
        var totalheight = $(window).height() + $(window).scrollTop() +150;
        if(finished && $(".container").height() <= totalheight && !nomore){
            finished=false;
            page++;
            getGoodsItem();
        }
    });
}
//店铺列表
function getShopList(){
    var url = '/salersman/home';
    var args = {
        action:'get_valid_shops'
    };
    $.postJson(url,args,function(res){
        if(res.success){
            var shoplist = res.shoplist;
            if(shoplist.length>0){
                if(shoplist.length>1){
                    $(".i-more-shop").removeClass("hide");
                }
                for(var key in shoplist){
                    var shop = shoplist[key];
                    var id = shop.id;
                    var name = shop.name;
                    $(".more_shop_list").append('<li class="item" data-id="'+id+'"><a class="goods-edit-btn f16" href="javascript:;">'+name+'</a></li>');
                }
            }
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//切换店铺
function switchShop(id){
    var url = '/salersman/home';
    var args = {
        action:'shop_change',
        shop_id:id
    };
    $.postJson(url,args,function(res){
        if(res.success){
            if(window.localStorage){
                localStorage.clear();
            }
            setTimeout(function(){
                location.reload();
            },200);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//slider回调函数
function slideCallBack(liswiper){
    var Swidth = $('#group_list_box #swiper_box').width();
    var widthW = $(window).width();
    var minheight = $(window).height()-190;
    var all_swiper_width = 0;
    if(!Swidth) {
        var swipW = $('.goods_group_list>li').size();
        if(widthW > 800) {
            all_swiper_width = swipW*800;
        } else {
            all_swiper_width = swipW*widthW;
        }
        $('#group_list_box #swiper_box').css({'width':all_swiper_width});//滑动初始化视窗宽度
    }
//    $("#group_list_box #swiper_box").css({minHeight:minheight+"px"});
//    $(".goods_list .goods-item").addClass("hide");
    $(".goods_group_list>li").removeClass("active");
    /*判断导航是否到达窗口边界,滑动导航*/
    var index = liswiper.activeIndex;
    var $active_tab = $(".goods_group_list>li").eq(index);
    var group_id = $active_tab.addClass("active").attr("data-id");
    var left=$active_tab.position().left;
    $(".goods_list_"+group_id).find(".goods-item").removeClass("hide");
    $(".wrap-goods-group").scrollLeft(left-60);
    replaceUrl("group",group_id);
}
