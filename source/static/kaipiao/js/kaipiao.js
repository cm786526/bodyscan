var cur_ipt = null,is_first=false,mul_weight=0,mul_counts=0,goods_list=null,cur_localorder_id = 0,
    total_tare_weight = 0, precision = 1, precision_type = 1, bar_pay=false,all_goods_list=[];
$(document).ready(function(){
    // if($(".modify-coefficient").val()!=""){
    // //防止页面back时input框保留之前的值，比较少见
    //     window.location.reload();
    // }
    // 判断是否为老板助手，如果是显示收款
    if(navigator.userAgent.indexOf("senguo:pfbossapp") >= 0){
        $(".mul_goods").remove();
        $(".kaipiao_btn").text("收款").addClass("boss-kp-btn orange_btn").removeClass("green-btn");
        if (navigator.userAgent.toLowerCase().indexOf("iphone") >= 0||navigator.userAgent.toLowerCase().indexOf("ipad") >= 0) {
            $(".fruit_pay_cash_group").addClass("hide");
        }
    }
    precision = parseInt($("#precision").val());
    precision_type = parseInt($("#precision_type").val());
    //功能按钮显示
    var btns=$(".wrap-kp-mulbox>a").size();
    if(btns==1){
        $(".wrap-kp-mulbox>a").removeClass("w48").css("width","100%");
    }else if(btns==2){
        $(".wrap-kp-mulbox>a").removeClass("w48 ml6").css("width","48.5%");
    }else{
        $(".wrap-kp-mulbox>a").removeClass("w48").css("width","32%");
    }
    //禁止ios弹性滑动
    $(window).on('scroll.elasticity', function(e) {
        if(e.target && $(e.target).closest(".kaipiao-goods-box").size()>0){
        }else{
            e.preventDefault();
        }
    }).on('touchmove.elasticity', function(e) {
        if(e.target && $(e.target).closest(".kaipiao-goods-box").size()>0){
        }else{
            e.preventDefault();
        }
    });
    // getAllGoods();
    // getPrinters();
    // searchSupply();
    if($("#multi_sale_goods").val()==1&&navigator.userAgent.indexOf("senguo:pfbossapp")<0){
        if(window.localStorage && (window.localStorage.getItem("localOrder")!="{}" && window.localStorage.getItem("localOrder")!=null)){
            var localorder = JSON.parse(localStorage.getItem("localOrder"));
            var length = getJSONLength(localorder);
            $(".goods_cookie").children("span").text(length);
            $(".goods_cookie").removeClass("hide");
            cur_localorder_id = JSON.parse(localStorage.getItem("cur_localorder_id"));
        }
        if(window.localStorage && window.localStorage.getItem("ifOneOrder")==1){
            var sale_record_id = $.getUrlParam("sale_record_id");
            if(sale_record_id){
                initOrder(sale_record_id);
            }
            $(".mul_goods").addClass("close-mul-goods");
            $(".kaipiao_btn").html("<span class='add-kp-order'>加入<br>订单</span>");
            $(".change_print").addClass("hide");
            //一单多品关闭净重、毛重
            $(".mweight_box").addClass("hide");
        }
    }else{
        $(".mweight_box").removeClass("hide");
        $(".goods_cookie").addClass("hide");
        window.localStorage && window.localStorage.removeItem("ifOneOrder");
        window.localStorage && window.localStorage.removeItem("localOrder");
    }
    //textToAudioForAndroid($(".goods_name").text());
    $(".search_result_list").addClass("kaipiao-goods-list pb0").removeClass("search-result-list");  //初始化搜索样式
    $(".wrap-search-result").addClass("padd0");
    cur_ipt = $('.entering-item-active').find('input');
}).on("click",".close_keyb",function(){
    $(this).closest(".pop-keyboard").addClass("hide");
}).on("touchstart",".keyboard_tb td , .keyboard-tb .keyboard-operate",function(){
    if(!$(this).hasClass("green-btn")){
        if($(this).hasClass("td-grey")){
            $(this).addClass("tdgrey-hover");
        }else{
            $(this).addClass("td-hover");
        }
    }
}).on("touchend",".keyboard-tb td , .keyboard-tb .keyboard-operate",function(){
    if($(this).hasClass("td-grey")){
        $(this).removeClass("tdgrey-hover");
    }else{
        $(this).removeClass("td-hover");
    }
    var key = $(this).attr("data-key");
    if($(this).hasClass('operate-tr')){
        return false;
    }
    startAudio(key);
    if($(this).closest(".pay_keyboard").size()>0){
        cashKeyboardOperate($(this));
    }else{
        if(!$(this).hasClass("click_key")){
            keyboardOperate($(this));
        }
    }
}).on("click",".keyboard-tb .click_key",function(){
    keyboardOperate($(this));
}).on("click",".goods-attr-ipt",function(){
    if($(this).hasClass("forbid-opacity") || $(this).hasClass("forbid-click")){
        return false;
    }
    is_first = true;
    $(".goods-attr-ipt").removeClass("goods-attr-ipt-focus");
    $(this).addClass("goods-attr-ipt-focus");
    cur_ipt = $(this);
    if($(this).hasClass("goods_mul_weight") || $(this).hasClass("goods_mul_counts")){
        return false;
    }else{
        if($("#keyboard").hasClass("hide")){
            ifShowTare(false);
            $("#keyboard").removeClass("hide");
        }
    }
}).on("click",".kaipiao_btn",function(){
    if($(this).hasClass("boss-kp-btn")){//收款
        if($(this).hasClass("forbid")){
            return false;
        }
        kaipiaoFinish($(this));
        return false;
    }
    kaipiaoFinish($(this));
}).on("click",".confirm_kaipiao",function(){
    kaipiaoFinish($(this));
}).on("click","body",function(e){
    var target = $(e.target);
    if(target.closest(".keyboard-nav").size()==0 && target.closest(".goods-attr-ipt").size()==0 && target.closest(".kaipiao_btn").size()==0){
        $("#keyboard").addClass("hide");
    }
}).on("click","#mul_keyboard",function(e){
    var target = $(e.target);
    if(target.closest(".wrap-mul-keyboard").size()==0){
        $(this).addClass("hide");
    }
}).on("click",".change_print",function(){
    if($(this).hasClass("forbid_click")){
        $(".pop-noprint").removeClass("hide");
        return false;
    }
    $(".pop-change").removeClass("hide");
}).on("click",".switch_pledge_status",function(){//交押金
    if($(this).attr("data-status")=="0"){
        Tip("该商品押金不允许修改");
        return false;
    }
    $(this).toggleClass("switch-active");
    if($(this).hasClass("switch-active")){
        $(".wrap-pledge-ipt-box,.pledge_ipt").removeClass("forbid-opacity");
        $(".pledge_ipt").val($(".pledge_ipt").attr("data-key"));
    }else{
        $(".pledge_ipt").val("");
        $(".wrap-pledge-ipt-box,.pledge_ipt").addClass("forbid-opacity");
    }
    cur_ipt = $(".pledge_ipt");
    keyboardOperate();
}).on("click",".mul_weight",function(){//使用多次称重
    $(".mweight_box").addClass("hide");
    $(".mul_weigh_txt,.mul_counts_txt").text("");
    $(".goods_mul_weight,.goods_mul_counts").val("");
    $(".goods_mul_weight,.goods_mul_counts").removeClass("goods-attr-ipt-focus");
    cur_ipt = $(".goods_mul_weight").addClass("goods-attr-ipt-focus");
    if($(".goods_weight").hasClass("forbid-opacity")){
        $(".goods_mul_weight").addClass("forbid-opacity");
        cur_ipt = $(".goods_mul_counts").addClass("goods-attr-ipt-focus");
    }
    $(".weigh_count").text("0");
    $("#mul_keyboard").removeClass("hide");
    reTareMoney(1);
}).on("click","#supply_list>li",function(){
    var goods_id = $(this).attr("data-goodsid");
    var kp_supplier_id = $(this).attr("data-id");
    $("#supply_list>li").removeClass("active");
    $(this).addClass("active");
    if(window.localStorage){
        localStorage.setItem("kp_supplier_id",kp_supplier_id);
    }
    window.location.href="/salersman/goodsSale/"+goods_id;
}).on("click",".search_supply",function(){
    if($(this).hasClass("forbid_click")){
        return false;
    }
    $(".pop-supply").removeClass("hide");
}).on("click",".go_add_print",function(){
    window.location.href="/salersman/home?tab=0";
}).on("click",".pop-system-conform",function(){
    window.location.reload();
}).on("click",".mul_goods",function(){
    if(!$(this).hasClass("close-mul-goods")){
        Tip("进入一单多品模式后，每个货品不能单独开票，可在添加多个货品后进入货品→一单多品页面选择订单开票",1800,"zb-black");
        $(this).addClass("close-mul-goods");
        $(".kaipiao_btn").html("<span class='add-kp-order'>加入<br>订单</span>");
        $(".change_print").addClass("hide");
        window.localStorage.setItem("ifOneOrder",1);
        cur_localorder_id = new Date().getTime();
        window.localStorage.setItem("cur_localorder_id",cur_localorder_id);
        ifShowTare(true);
    }else{
        Tip("即将退出 一单多品模式，货品可单独开票",1800,"zb-black");
        $(this).removeClass("close-mul-goods");
        $(".kaipiao_btn").html("开票");
        $(".change_print").removeClass("hide");
        window.localStorage.setItem("ifOneOrder",0);
        ifShowTare(false);
    }
}).on("click",".goods_back",function(){
    $(".pop-kpgoods").addClass("hide");
}).on("click",".choose_goods",function(){
    $(".pop-kpgoods").removeClass("hide");
}).on("click",".kaipiao_goods_list>li",function(){
    if($(this).hasClass("active")){
        return false;
    }
    var goods_id = $(this).attr("data-id"),
    gname = $(this).find(".gname").text();
    changeGoods(goods_id,gname);
}).on("click",".search_result_list>li",function(){
    // var goods_id = $(this).attr("data-id"),
    // gname = $(this).find(".gname").text();
    // changeGoods(goods_id,gname);
}).on("click",".choose_goods_type>a",function(){
    if($(this).hasClass("self-sell")){
        if($(this).hasClass("self-active")){
            $(".goods_type_0").addClass("hide");
            $(this).removeClass("self-active");
        }else{
            $(".goods_type_0").removeClass("hide");
            $(this).addClass("self-active");
        }
    }else{
        if($(this).hasClass("other-active")){
            $(".goods_type_1").addClass("hide");
            $(this).removeClass("other-active");
        }else{
            $(".goods_type_1").removeClass("hide");
            $(this).addClass("other-active");
        }
    }
}).on("click",".mweight_box>a",function(){
    var index = $(this).index();
    $(".mweight_box>a").removeClass("weight-active").eq(index).addClass("weight-active");
    reTareMoney(index+1);
}).on("click","#fruit_pay_btn",function(){
    if (bar_pay==true) {
        Tip("请等待支付完成");
        return false;
    }
    if ($(this).closest("#table_keyboard").hasClass("barcode_pay")) {
        barCodePay($(".fruit_pay_code_btn"));
        return false;
    }
    payForCash($(this));
}).on("click",".pay_other_way_box>li",function(){ //切换支付方式
    if ($(this).hasClass("active")) {
        return false;
    }
    if (bar_pay==true) {
        Tip("请等待支付完成");
        return false;
    }
    switchPayType($(this));
}).on("click",".fruit-pay-cash-input",function(){
    $(this).addClass("pay-cash-ipt-focus");
}).on("click",".fruit_pay_code_btn",function(){
    if (bar_pay==true) {
        Tip("请等待支付完成");
        return false;
    }
    barCodePay($(".fruit_pay_code_btn"));
}).on("click","#fruit_pay_bar_pay",function(){ //重新扫码
    if (bar_pay==true) {
        Tip("请等待支付完成");
        return false;
    }
    getShopScan();
}).on("touchstart",".orange_btn",function(){
    if(!$(this).hasClass("forbid")){
        $(this).addClass("orange-btn-hover");
    }
}).on("touchend",".orange_btn",function(){
    $(this).removeClass("orange-btn-hover");
}).on('click', '.predict-coefficient-box', function() {
    cur_ipt = $('.modify-coefficient');
}).on('touchend', '.entering-item , .next_entering_item', function(event) {
    setTimeout(function(){
        cur_ipt = $('.entering-item-active').find('input');
    },100)
}).on('click', '.add_member_btn', function() {
    cur_ipt = $('.search_member_id');
}).on('click', '.goods_list_box li', function(event) {
    cur_ipt = $('#pop_entering_goods').find('.yesterday_wasted');
}).on('click', '.entering_item', function() {
    cur_ipt = $(this).find('input');
}).on('click', '.search_goods_list_box li', function() {
    cur_ipt = $('#pop_entering_goods').find('.yesterday_wasted');
}).on('click', '.ratio-list li', function() {
    cur_ipt = $('.modify-coefficient');
})



//左侧选择商品或搜索结果选择商品
function changeGoods(goods_id,gname){
    $(".kaipiao_goods_list>li").removeClass("active");
    $(".kaipiao_goods_list").find(".goods_"+goods_id).addClass("active");
    $(".load-txt").text("商品更新中...");
    $(".wrap-loading-box").removeClass("hide");
    var self_active = 0, other_active = 0;
    if($(".sell_self").hasClass("self-active")){
        self_active = 1;
    }
    if($(".sell_other").hasClass("other-active")){
        other_active = 1;
    }
    if(window.localStorage){
        localStorage.removeItem("kp_supplier_id");
    }
    textToAudioForAndroid(gname);
    window.location.href="/salersman/goodsSale/"+goods_id+"?self_active="+self_active+"&other_active="+other_active;
}
function cashKeyboardOperate($obj){
    var regx = /^[0-9]\d*(\.\d{0,2})?$/;
    var $this = $obj;
    var $target = $this.closest(".keyboard_tb");
    if ($target.hasClass("cash_pay")) {
        var cur_ipt = $("#fruit_pay_input");
    }else{
        var cur_ipt = $("#fruit_pay_code_input");
    }
    var key_val = cur_ipt.val();
    if($this.hasClass("key-item")){
        var temp_key_val = key_val+$this.text();
        if(!regx_money.test(temp_key_val)){
            return false;
        }
        key_val = temp_key_val;
    }else if($this.hasClass("del-key")){
        if(key_val==""){
            return false;
        }else{
            key_val = key_val.slice(0, key_val.length-1);
        }
    }
    cur_ipt.val(key_val);
    if(!$this.hasClass("key-finish")){
        orderCashIpt();
    }
}
//切换支付方式
function switchPayType($obj){
    var $this = $obj;
    var index = $obj.index();
    var $paybox=$this.closest(".pop-bwin");//当前结算框
    var type = $this.attr("data-type");
    addLog({operate_text:"switchPayType",pay_type:type,pay_index:index});
    var last_update_timestamp  = new Date().getTime();
    $("#fruit_pay_menu").attr("data-time",last_update_timestamp);
    $(".pay_other_way_box>li").removeClass("active").eq(index).addClass("active");
    $(".fruit_pay_form").addClass("hide").eq(index).removeClass("hide");
    $paybox.find("#fruit_pay_btn,.fruit_pay_code_btn").removeClass("forbid");
    $paybox.find("#fruit_pay_input,#fruit_pay_code_input").blur();
    $paybox.find(".error_txt").text("");
    $("#table_keyboard").removeClass("hide");
    $("#fruit_pay_btn").removeClass("fruit_pay_code_btn");
    if($obj.is("#pay_by_cash")){
        $paybox.find("#fruit_pay_return").text("0");
        $paybox.find("#fruit_pay_input").val("").focus();
        $(".fruit-pay-cash-input").addClass("pay-cash-ipt-focus");
        $(".fruit-pay-icon").css({
            "background-image":'url("/static/kaipiao/img/icon_cash.png")'
        });
        $(".keyboard_tb").addClass("cash_pay").removeClass("barcode_pay");
        $("#should_rev").html("现金收款：");
    }else if($obj.is("#pay_by_shop_scan")){
        $(".fruit-pay-icon").css({
            "background-image":'url("/static/kaipiao/img/icon_shop.png")'
        });
        $(".keyboard_tb").addClass("barcode_pay").removeClass("cash_pay");
        $("#fruit_pay_btn").addClass("fruit_pay_code_btn");
        $("#should_rev").html("商家扫码：");
        $paybox.find("#fruit_pay_code_input").val("").focus();
        if (navigator.userAgent.toLowerCase().indexOf("android") >= 0) {
            $("#table_keyboard").addClass("hide");
            $("#fruit_pay_btn").removeClass("fruit_pay_code_btn");
            //调用设备扫码
            getShopScan();
        }

    }
}
//编辑一品多单时初始化商品数据
function initOrder(sale_record_id){
    var order = JSON.parse(window.localStorage.getItem("localOrder"))[cur_localorder_id][sale_record_id];
    var goods_unit = order.goods_unit;
    $(".goods_total").text(order.singer_total);
    $(".commission_total").text(order.hangfei_total);
    $(".goods_price").val(order.goods_price);
    $(".goods_commission").val(order.commission);
    $(".goods_counts").val(order.commission_mul);
    $(".goods_weight").val(order.sales_num);
    if(order.goods_unit=="件"){
        $(".goods_weight").val("");
    }
    $(".mul_weigh_txt").text(order.sales_num_total);
    $(".mul_counts_txt").text(order.commission_mul_total);
    var weigh_count = order.sales_num_total.split("+").length;
    $(".weigh_count").text(weigh_count);
    $("#sale_record_id").val(order.sale_record_id);
    if(!$(".pledge_box").hasClass("hide")){
        if(order.deposit>0){
            $(".pledge_total").text(order.deposit_total);
            $(".pledge_ipt").val(order.deposit);
            $(".switch_pledge_status").addClass("switch-active");
            $(".wrap-pledge-ipt-box,.pledge_ipt").removeClass("forbid-opacity");
        }
    }
    keyboardOperate();
    $(".kaipiao_btn").removeClass("forbid");
}

//调用android播放数字键
function startAudio(key){
    if(navigator.userAgent.indexOf("senguo:androidcfapp") >= 0){
        try{
            window.NativeApi.speak(key);
        }catch(e){
            Tip("当前APP版本过低，请及时更新");
        }
    }
}

//开票
function kaipiaoFinish($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    if($(".supply_name").text()=="未选择"){
        Tip("请先选择供应商");
        return false;
    }
    var sale_record_id = "sid"+new Date().getTime();  //前端生成
//    var sale_record_id = $.trim($("#sale_record_id").val());
    var fact_price = $(".goods_price").val();
    if(fact_price==""){
        return Tip("实际售价不能为空");
    }
    var sales_num = $(".goods_weight").val();
    if(!$(".goods_weight").hasClass("float_num_ipt") && sales_num.indexOf(".")>-1){
        return Tip("商品重量不允许有小数，请手动修正");
    }
    if(sales_num=="" && $(".page-goods").attr("data-unit")!="件"){
        return Tip("重量不能为空");
    }
    var commission = $(".goods_commission").val();
    if(commission==""){
        return Tip("行费不能为空");
    }
    var commission_mul = $(".goods_counts").val();
    if(commission_mul==""){
        return Tip("件数不能为空");
    }
    var pledge = $(".pledge_ipt").val() || 0;
    if($(".switch_pledge_status").hasClass("switch-active") && pledge==""){
        return Tip("押金不能为空");
    }
    if($obj.hasClass("need_sure") && !$(".mul_goods").hasClass("close-mul-goods")&&!$obj.hasClass("orange_btn")){
        $(".confirm_kaipiao").removeClass("forbid");
        $(".pop-conform").removeClass("hide");
        return false;
    }else{
        $(".pop-conform").addClass("hide");
        $(".kaipiao_btn").addClass("forbid");
    }
    var receipt_money = $(".total_price").text();
    if($(".page-goods").attr("data-unit")=="件"){
        sales_num = commission_mul;
    }
    var sales_num_total = $(".mul_weigh_txt").text();
    var commission_mul_total = $(".mul_counts_txt").text();
    var local_print = 0;
    if($(".change_print").attr("data-id")=="-1"){
        local_print = 1;
    }
    var args = {
        sale_record_id:sale_record_id,
        fact_price:fact_price,
        sales_num:sales_num,
        commission:commission,
        commission_mul:commission_mul,
        deposit:pledge,
        receipt_money:receipt_money,
        sales_num_total:sales_num_total,
        commission_mul_total:commission_mul_total,
        local_print:local_print,
        precision:precision,
        precision_type:precision_type
    };
    if($(".mul_goods").hasClass("close-mul-goods")){//开启一单多品
        var goods_id = $(".page-goods").attr("data-id"),
        goods_price = fact_price,
        goods_unit = $(".page-goods").attr("data-unit"),
        goods_name = $(".goods_name").text(),
        supply_name = $(".supply_name").text(),
        hangfei_total = $(".commission_total").text(),
        singer_total = $(".goods_total").text();
        args.goods_id = goods_id;
        args.goods_name = goods_name;
        args.goods_price = fact_price;
        args.goods_unit = goods_unit;
        args.supply_name = supply_name;
        args.hangfei_total = hangfei_total;
        args.singer_total = singer_total;
        args.deposit_total = $(".pledge_total").text();
        operateLocalOrder(args, "add");
        $(".wrap-loading-box").removeClass("hide");
        window.location.href="/salersman/goodsSale/"+$(".page-goods").attr("data-id");
        return false;
    }
    if(!$(".mweight_box").hasClass("hide")){
        var weight_type = parseInt($(".mweight_box>a.weight-active").attr("data-id"));
        var tare_weight = parseFloat($(".kaipiao_goods_list>li.active").attr("data-tare"));
        if(tare_weight!=0){
            if(weight_type==1){//毛重
                args.net_weight = (parseFloat(sales_num) - tare_weight*parseFloat(commission_mul)).toFixed(2);
            }else{//净重
                args.net_weight = sales_num;
                args.sales_num = (parseFloat(sales_num) + tare_weight*parseFloat(commission_mul)).toFixed(2);
            }
        }
    }
    $obj.addClass("forbid");
    $(".wrap-loading-box").removeClass("hide");
    $.postJson("",args,function(res) {
        $obj.removeClass("forbid");
        $(".wrap-loading-box").addClass("hide");
        if (res.success) {
            // 判断是否为老板助手，如果是显示收款
            if(navigator.userAgent.indexOf("senguo:pfbossapp") >= 0){
                $("#fruit_pay_menu").attr("data-record-id",res.valid_record_id);
                $("#sale_record_id").val(res.sale_record_id);
                $(".sale_record_num").text(res.sale_record_num);
                showBalancePop();
                return false;
            }
            if(res.print_body){
                printTicket(res.print_body);
            }
        	kpFinish(res);
            Tip("开票成功");
        }else{
            if(res.error_code){
                $(".pop-system-conform").removeClass("hide");
                $(".pop-system-conform .system-tip").text(res.error_text);
            }else{
                Tip(res.error_text);
            }
        }
    },function(){
        $obj.removeClass("forbid");
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
        $(".wrap-loading-box").addClass("hide");
        $obj.removeClass("forbid");
    },3000);
}
//开票成功
function kpFinish(res){
    var goods_unit = $(".page-goods").attr("data-unit");
    $(".weigh_count").text("0");
    $(".mul_weigh_txt,.mul_counts_txt").text("");
    $("#sale_record_id").val(res.sale_record_id);
    $(".sale_record_num").text(res.sale_record_num);
    $(".goods_price,.goods_weight,.goods_counts").val("");
    $(".commission_total,.goods_total,.pledge_total,.total_price").text(0);
    $(".goods-attr-ipt").removeClass("goods-attr-ipt-focus");
    if($(".goods_weight").hasClass("forbid-opacity")){
        cur_ipt = $(".goods_counts").addClass("goods-attr-ipt-focus");
    }else{
        cur_ipt = $(".goods_weight").addClass("goods-attr-ipt-focus");
    }
    $(".pledge_ipt").val($(".pledge_ipt").attr("data-key"));//押金重置
    if(parseFloat($(".pledge_ipt").attr("data-key"))>0){//押金大于0则默认开启并显示
        $(".wrap-pledge-ipt-box,.pledge_ipt").removeClass("forbid-opacity");
        $(".switch_pledge_status").addClass("switch-active");
    }else{//押金等于0则默认关闭
        $(".wrap-pledge-ipt-box,.pledge_ipt").addClass("forbid-opacity");
        $(".switch_pledge_status").removeClass("switch-active");
    }
    $(".goods_price").val($(".page-goods").attr("data-price"));
    ifShowTare(false);
    total_tare_weight = 0;
}
//累加数组中的元素
function getArrAdd(arr){
    var all = 0;
    for(var i=0; i<arr.length; i++){
        all += parseFloat(arr[i]);
    }
    return all;
}
function keyboardOperate($obj){
    if(cur_ipt==null){
        return false;
    }
    var key_val = cur_ipt.val();
    if($obj){
        if($obj.hasClass("delete_key")){
            if($obj.hasClass("mul_delete")){
                if(key_val==""){
                    return false;
                }else{
                    key_val = key_val.slice(0, key_val.length-1);
                }
            }else{
                if(key_val==""){
                    $(".kaipiao_btn").addClass("forbid");
                    return false;
                }else{
                    if(is_first){
                        key_val = "";
                    }else{
                        key_val = key_val.slice(0, key_val.length-1);
                    }
                }
            }
        }else if($obj.hasClass("finish_key")){
            is_first = false;
            if(key_val==""){
                Tip("该值不能为空");
                return false;
            }else if(!regx_money.test(key_val)){
                Tip("数据格式不对，且不能超过两位小数");
                return false;
            }
            $("#keyboard").addClass("hide");
        }else if($obj.hasClass("mul_add")){//累加
            accumulation();
            return false;
        }else if($obj.hasClass("clear_prev")){//清除上次
            if($(".mul_weigh_txt").text()==""){
                return false;
            }else{
                var weigh_txt = $(".mul_weigh_txt").text(), counts_txt = $(".mul_counts_txt").text();
                var weigh_arr = weigh_txt.split("+"), counts_arr = counts_txt.split("+");
                var prev_weigh = weigh_arr[weigh_arr.length-1], prev_count = counts_arr[counts_arr.length-1];
                if(weigh_arr.length>1){
                    prev_weigh = "+"+prev_weigh;
                    prev_count = "+"+prev_count;
                }
                var new_weigh_txt = weigh_txt.substring(0,weigh_txt.lastIndexOf(prev_weigh));
                var new_counts_txt = counts_txt.substring(0,counts_txt.lastIndexOf(prev_count));
                $(".mul_weigh_txt").text(new_weigh_txt);
                $(".mul_counts_txt").text(new_counts_txt);
            }
        }else if($obj.hasClass("close_mul_add")){//结束累加
            if($(".goods_mul_weight").val()!="" && $(".goods_mul_counts").val()!=""){
                accumulation();
            }
            if(!$(".mul_weigh_txt").text()==""){
                var weigh_ctxt = $(".mul_weigh_txt").text(), counts_ctxt = $(".mul_counts_txt").text();
                var weigh_carr = weigh_ctxt.split("+"), counts_carr = counts_ctxt.split("+");
                var all_weigh_carr = getArrAdd(weigh_carr), all_counts_carr = getArrAdd(counts_carr);
                $(".goods_weight").val(all_weigh_carr);
                $(".goods_counts").val(all_counts_carr);
                if($(".goods_weight").hasClass("forbid-opacity")){
                    $(".goods_weight").val("");
                }
            }
            $("#mul_keyboard").addClass("hide");
        }else if($obj.hasClass('next_entering_item')){   //下一项
            var cur_active = $('.entering-item-active');
            var index = $('.entering_item').index(cur_active);
            $('.entering-item').removeClass('entering-item-active');
            var next_index = index+1;
            autoWriteIn();
            if(index==5){
                next_index = 0;
            }
            $('.entering_item').eq(next_index).addClass('entering-item-active');
            return false;
        }else if($obj.hasClass('sure_entering_goods')){
            typeInGoodsInfo();
            return false;
        }else if($obj.hasClass('search_keyboard_sure')){
            var val = $('.search_member_id').val();
            if(!val){
                return Tip("请输入手机号或个人ID");
            }
            getUserInfo(val);
            return false;
        }else if($obj.hasClass('keyboard_cancel')){
            $obj.closest('.pop-bwin').addClass('hide');
            return false;
        }else if($obj.hasClass('set_keyboard_sure')){
            var type = $('.cur_region_name').attr("data-type");
            if(type == "ratio"){
                setCoefficient();
                return false;
            }else{
                setDiscountRatio();
                return false;
            }     
        }else{//数字输入
            if($("#mul_keyboard").hasClass("hide")){
                if(is_first){//首次输入
                    $(".keyboard_ipt").val("");
                    key_val = "";
                }
            }
            is_first = false;
            var temp_key_val = key_val+$obj.text();
            if(cur_ipt.hasClass("float_num_ipt")){//可以输入小数的情况
                if(!regx_money.test(temp_key_val)){
                    return false;
                }else{
                    if(cur_ipt.hasClass("goods_price") && parseFloat(temp_key_val)>9999.99){//价格不大于9999.99
                        return false;
                    }else if(cur_ipt.hasClass("goods_weight") && parseFloat(temp_key_val)>99999.99){
                        return false;
                    }else if(cur_ipt.hasClass("goods_mul_weight") && parseFloat(temp_key_val)>99999.99){
                        return false;
                    }
                    key_val = temp_key_val;
                }
            }else{
                if(temp_key_val.indexOf(".")>-1){//禁止输入小数的情况
                    return false;
                }else{
                    if(temp_key_val.length>4 && cur_ipt.hasClass("goods_counts")){//件数不超过4位数
                        return false;
                    }else if(temp_key_val.length>5 && cur_ipt.hasClass("pledge_ipt")){
                        return false;
                    }else if(temp_key_val.length>4 && cur_ipt.hasClass("goods_mul_counts")){
                        return false;
                    }else if(temp_key_val.length>5 && cur_ipt.hasClass("goods_mul_weight")){
                        return false;
                    }else if(temp_key_val.length>5 && cur_ipt.hasClass("goods_weight")){
                        return false;
                    }
                    key_val = temp_key_val;
                }
            }
        }
    }
    if(key_val==""){
        $(".kaipiao_btn").addClass("forbid");
    }
    cur_ipt.val(key_val);
    var commission = parseFloat($(".goods_commission").val() || 0);
    var price = parseFloat($(".goods_price").val() || 0);
    var weight = parseFloat($(".goods_weight").val() || 0);
    var counts = parseFloat($(".goods_counts").val() || 0);
    var pledge = parseFloat($(".pledge_ipt").val() || 0);
    if($(".page-goods").attr("data-unit")=="件"){
        weight = counts;
    }
    if($(".pledge_box").hasClass("hide")){//未开启押金
        pledge = 0;
    }
    if(!$(".mweight_box").hasClass("hide")){
        var weight_type = parseInt($(".mweight_box>a.weight-active").attr("data-id"));
        var tare_weight = parseFloat($(".kaipiao_goods_list>li.active").attr("data-tare"));
        if(weight_type==2 && tare_weight!=0){//净重模式且皮重不为0，重量要加上皮重
            weight = parseFloat((weight+(tare_weight*counts)).toFixed(2));
        }
    }
    var commission_total = 0, goods_total = 0, total_price = 0;
    if(counts==0){
        commission_total = 0;
    }else{
        commission_total = parseFloat((commission*counts).toFixed(2));
    }
    if(price==0 || weight==0){
        goods_total = 0;
    }else{
        goods_total = parseFloat((price*weight).toFixed(2));
    }
    var pledge_total = 0;
    if(pledge!=0){
        pledge_total = parseFloat((pledge*counts).toFixed(2));
    }
    total_price = moneySwitch(commission_total+goods_total+pledge_total);
    $(".commission_total").text(commission_total);
    $(".goods_total").text(goods_total);
    $(".total_price").text(total_price);
    $(".pledge_total").text(pledge_total);
    if($(".kaipiao_btn").hasClass("forbid") && $(".goods_price").val()!="" && $(".goods_counts").val()!="" && $(".goods_commission").val()!=""){
        if($(".switch_pledge_status").hasClass("switch-active") && $(".pledge_ipt").val()==""){
            $(".kaipiao_btn").addClass("forbid");
        }else if($(".goods_weight").val()!="" && $(".page-goods").attr("data-unit")!="件"){
            $(".kaipiao_btn").removeClass("forbid");
        }else if($(".goods_weight").val()=="" && $(".page-goods").attr("data-unit")=="件"){
            $(".kaipiao_btn").removeClass("forbid");
        }else{
            return false;
        }
    }
}
//计数累加
function accumulation(){
    if($(".goods_mul_weight").val()=="" && !$(".goods_mul_weight").hasClass("forbid-opacity")){
        return Tip("请输入重量");
    }
    if(!$(".goods_mul_weight").hasClass("forbid-opacity") && $(".goods_mul_counts").val()==""){
        return Tip("请输入件数");
    }
    var now_weigh = $(".goods_mul_weight").val(), now_counts = $(".goods_mul_counts").val();
    if($(".goods_mul_weight").hasClass("forbid-opacity")){
        now_weigh = now_counts;
    }
    var mul_weight_txt = $(".mul_weigh_txt").text()==""?"":$(".mul_weigh_txt").text()+"+";
    var mul_counts_txt = $(".mul_counts_txt").text()==""?"":$(".mul_counts_txt").text()+"+";
    $(".mul_weigh_txt").text(mul_weight_txt+now_weigh);
    $(".mul_counts_txt").text(mul_counts_txt+now_counts);
    $(".goods_mul_weight,.goods_mul_counts").val("");
    $(".weigh_count").text(parseInt($(".weigh_count").text())+1);
    if(!$(".goods_mul_weight").hasClass("forbid-opacity")){
        $(".goods_mul_weight").addClass("goods-attr-ipt-focus");
        $(".goods_mul_counts").removeClass("goods-attr-ipt-focus");
        cur_ipt = $(".goods_mul_weight");
    }
}
//搜索供应商
function searchSupply(){
    var key = $(".goods_name").text();
    var args = {
        action:"get_goods_supplier",
        name:key
    };
    $.postJson("/common/suppliersearch",args,function(res){
        if(res.success){
            var staff_list = res.data_list, if_choose = false;
            $("#supply_list").empty();
            $(".no_result").addClass("hide");
            $(".no_supplier").removeClass("hide");
            if(staff_list.length==0){
                $(".no_result").removeClass("hide");
                return false;
            }
            if(staff_list.length<=1){//只有一个供应商的情况
                $(".no_supplier").addClass("hide");
                $(".supply_type_text").removeClass("mt2").addClass("mt10");
                $(".search_supply").addClass("forbid_click");
            }else{//出现同名商品而有多个供应商的情况，119需要重新选择供应商
                var shop_id = parseInt($("#sale_record_id").attr("data-shopid"));
                var supply_type = parseInt($(".search_supply").attr("data-type"));
                if(supply_type==1){
                    var kp_supplier_id = localStorage.getItem("kp_supplier_id");
                    if(kp_supplier_id==null){
                        $(".supply_name").attr("data-id","-1").text("未选择");
                        if_choose = true;
                    }
                }
            }
            var lis = "", cur_supply_id = $(".supply_name").attr("data-id");
            for(var i=0; i<staff_list.length; i++){
                var staff = staff_list[i],active = "";
                var phone = staff.supplier_phone||"无电话";
                if(cur_supply_id==staff.supplier_id){
                    active = "active";
                }
                lis += '<li class="grey_btn '+active+'" data-id="'+staff.supplier_id+'" data-goodsid='+staff.goods_id+'>'+
                        '<p>'+
                            '<span class="print-tspan">'+(staff.supplier_name||"自营")+'<span class="c999"> '+phone+'</span></span>'+
                            '<i class="i-check"></i>'+
                        '</p>'+
                    '</li>';
            }
            $("#supply_list").append(lis);
            if(if_choose){
                $(".pop-supply").removeClass("hide");
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
var goods_item = '{{each goods_list as goods}}'+
                '<li data-id="{{goods.id}}" data-tare="{{goods.tare_weight}}" class="goods_{{goods.id}} grey_btn {{ if goods.top }}goods-item-stick{{/if}} {{ if goods.hide }}not-see{{/if}} goods_type_{{goods.supply_type_code}}">'+
                    '<dl class="row-dl">'+
                        '<dd><img src="{{goods.img_url}}?imageView2/1/w/100/h/100" alt="商品图片"></dd>'+
                        '<dt>'+
                            '<p class="f20 c333 clip gname">{{goods.name}}</p>'+
                            '<p class="f16 c999 mt2 overhidden">'+
                                '<span class="c666">{{goods.supplier_name || "无供应商"}}</span>'+
                                '<span class="f12 goods-in-type {{ if goods.supply_type==""}}hide{{/if}} {{ if goods.supply_type_code==1}}green-type{{/if}}">{{goods.supply_type}}</span>'+
                            '</p>'+
                        '</dt>'+
                    '</dl>'+
                '</li>'+
                '{{/each}}';
//获取商品数据
function getAllGoods(){
    var args = {
        action:"goods_list",
        active:"1",
        page:0
    };
    $.postJson("/salersman/goodsmanage",args,function(res){
        if(res.success){
            var datalist = res.goods_list;
            goods_list = datalist;
            for(var key in goods_list){
                all_goods_list.push(goods_list[key]);
            }
            var render = template.compile(goods_item);
            var html = render(res);
            $(".kaipiao_goods_list").append(html);
            var goods_id = $(".page-goods").attr("data-id");
            $(".goods_"+goods_id).addClass("active");
            if($.getUrlParam("self_active") && $.getUrlParam("self_active")=="0"){
                $(".goods_type_0").addClass("hide");
                $(".sell_self").removeClass("self-active");
            }
            if($.getUrlParam("other_active") && $.getUrlParam("other_active")=="0"){
                $(".goods_type_1").addClass("hide");
                $(".sell_other").removeClass("other-active");
            }
            ifShowTare(false);
            toPinyin(); //转拼音
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
function ifShowTare(ifRetare){
    //皮重为0 或者 以件出售就关闭净重的显示
    var tare_weight = parseFloat($(".kaipiao_goods_list>li.active").attr("data-tare"));
    var goods_unit = $(".page-goods").attr("data-unit");
    if(!tare_weight || goods_unit=="件" || $(".mul_goods").hasClass("close-mul-goods")){
        $(".mweight_box").addClass("hide");
        total_tare_weight = 0;
    }else{
        $(".mweight_box>a").removeClass("weight-active").eq(0).addClass("weight-active");
        $(".mweight_box").removeClass("hide");
        total_tare_weight = parseFloat($(".goods_counts").text() || 0)*tare_weight;
    }
    if(ifRetare){
        reTareMoney(1);
    }
}
//重新计算货品总价和票据金额,只考虑净重且有皮重且不是件为单位的情况
function reTareMoney(type){
    var price = parseFloat($(".goods_price").val() || 0);
    var weight = parseFloat($(".goods_weight").val() || 0);
    var counts = parseFloat($(".goods_counts").val() || 0);
    var goods_total = 0, total_price = 0;
    var pledge_total = parseFloat($(".pledge_total").text());
    var commission_total = parseFloat($(".commission_total").text());
    var goods_unit = $(".page-goods").attr("data-unit");
    if(goods_unit=="件"){
        weight = counts;
    }
    if(type==2){//净重情况下加上皮重
        var tare_weight = parseFloat($(".kaipiao_goods_list>li.active").attr("data-tare"));
        total_tare_weight = counts*tare_weight;
        weight = parseFloat((weight + total_tare_weight).toFixed(2));
    }else{
        total_tare_weight = 0;
    }
    goods_total = parseFloat((price*weight).toFixed(2));
    total_price = moneySwitch(commission_total+goods_total+pledge_total);
    $(".goods_total").text(goods_total);
    $(".total_price").text(total_price);
}

//根据后台设置进行金钱精度转换
function moneySwitch(money){
    var result = 0;
    //先进行一个千分位的四舍五入，保证3.0999这种情况在保留一位小数的时候能是对的
    var money = parseFloat(money).toFixed(3);
    try{
        var int_part = money.split(".")[0], //小数点前的整数
        point_num = money.split(".")[1],//取小数点后面的数
        precision_num = point_num[3-precision];
        if((precision_type==1 && precision_num>4) || (precision_type==3 && precision_num>0)){//五入&进1的情况
            if(precision==1){
                point_num = parseInt(point_num)+10+"";
                if(point_num.length>3){//说明往整数位进1
                    int_part = parseInt(int_part)+1+"";
                    point_num = point_num[1]+point_num[2];
                }else{
                    point_num = point_num[0]+point_num[1];
                }
            }else if(precision==2){
                point_num = parseInt(point_num)+100+"";
                if(point_num.length>3){//说明往整数位进1
                    int_part = parseInt(int_part)+1+"";
                    point_num = point_num[1];
                }else{
                    point_num = point_num[0];
                }
            }else if(precision==3){
                int_part = parseInt(int_part)+1+"";
                point_num = 0;
            }
        }else{//去掉尾数的情况和四舍的情况以及不进1的情况
            if(precision==1){
                point_num = point_num[0]+point_num[1];
            }else if(precision==2){
                point_num = point_num[0];
            }else if(precision==3){
                point_num = 0;
            }
        }
        result = parseFloat(int_part+"."+point_num);
    }catch(e){
        return parseFloat(money).toFixed(2);
    }
    return result;
}

//付款输入金额验证
function orderCashIpt(){
    var money = parseFloat($.trim($("#fruit_pay_input").val()) || 0);
    var ys_money = parseFloat($("#fruit_pay_money").text());
    if(money == 0){
        $("#fruit_pay_return").text(0);
    }else{
        $("#fruit_pay_return").text((money-ys_money).toFixed(2));
    }
}
// 显示结算页面
function showBalancePop(){
    $(".pop-keyboard").addClass("hide");
    $("#fruit_pay_money").text($(".total_price").text());
    $("#fruit_pay_input").val("").addClass("pay-cash-ipt-focus");
    $("#fruit_pay_return").text("0");
    switchPayType($(".pay_other_way_box>li").eq(0));
    newTempOrder();
    $(".pop-paytype").removeClass("hide");
}
//现金结算
function payForCash($obj){
    var $this=$obj;
    if($this.hasClass("forbid")){
        return false;
    }
    var url = "/accountant/home";
    if($.trim($("#fruit_pay_input").val())==""){
        return Tip("实收金额为空，无法完成结算");
    }
    var form_money = parseFloat($("#fruit_pay_input").val()); //实收金额
    var case_money = parseFloat($("#fruit_pay_return").text());//找零
    var regx = /^[0-9]\d*(\.\d{0,2})?$/;
    if(!regx.test(form_money) || isNaN(form_money)){
        setTimeout(function(){
            $("#fruit_pay_input").select().focus();
        },100);
        Tip("实收金额必须为数字，最多保留2位小数");
        return false;
    }
    if(case_money<0){
        setTimeout(function(){
            $("#fruit_pay_input").select().focus();
        },100);
        Tip("实收金额不足，无法完成结算");
        return false;
    }
    addLog({operate_text:"payForCash",operate_info_text:"现金支付"});
    var balance_args=get_balance_params();
    balance_args.action="pay_withcash";
    balance_args.actual_payment=form_money;
    balance_args.change_amount=case_money;
    $this.addClass("forbid");
    bar_pay = true;
    $.postJson(url,balance_args,function(res){
        $this.removeClass("forbid");
        bar_pay = false;
        if(res.success){
            if(res.print_body){
                printTicket(res.print_body);
            }
            finishPay("现金",form_money);
        }else{
            Tip(res.error_text);
            addLog({operate_text:"payCash",operate_info_text:"现金支付后台fail",error:res});
        }
    },function(){
        $this.removeClass("forbid");
        bar_pay = false;
        addLog({operate_text:"payCash",operate_info_text:"现金支付后台error"});
        Tip("订单数据提交失败，请联系森果管理员或重新提交数据");
    },function(){
        $this.removeClass("forbid");
        bar_pay = false;
        addLog({operate_text:"payCash",operate_info_text:"现金支付超时"});
        Tip("无网络或请求超时，请检查网络连接后重试");
    },5000);
}
//支付完成
function finishPay(type,money){
    removeLog();
    Tip("收款成功");
    textToAudioForAndroid(type+"收款"+money+"元");
    addLog({operate_text:"paySuccess",operate_info_text:"支付成功",pay_type:type});
    setTimeout(function(){
        window.location.reload(true);
    },1000);
}
//支付码支付
function barCodePay($obj){
    var code = $.trim($("#fruit_pay_code_input").val());
    var $orderBox = $("#fruit_pay_form_shop");
    var $this=$obj;
    $orderBox.find(".error_txt").text("");
    if(!$orderBox.hasClass("hide")){
        if(code==""){
            $orderBox.find(".error_txt").text("支付码不能为空");
            return false;
        }else{
            if(code.length!=18 || isNaN(code)){
                $orderBox.find(".error_txt").text("支付码应为18位数字，请重新扫码或输入");
                $orderBox.find("#fruit_pay_code_input").select();
                return false;
            }else{
                if($obj.hasClass("forbid")){
                    return false;
                }
                bar_pay = true;
                $this.addClass("forbid").val("支付中...");
                $orderBox.find(".error_txt").html("支付中"+"<span class='dot-loading'>......</span>");
                addLog({operate_text:"payWithBarCode",operate_info_text:"条码支付"});
                var url ="/accountant/home";
                var balance_args=get_balance_params();
                balance_args.action = "pay_barcode";
                balance_args.auth_code = code;
                var args = balance_args;
                $this.addClass("forbid");
                $.postJson(url,args,function(res){
                    $this.removeClass("forbid");
                    if(res.success){
                        if(res.print_body){
                            printTicket(res.print_body);
                        }
                        bar_pay = false;
                        var form_money = $("#fruit_pay_money").text();
                        finishPay("扫码",form_money);
                    }else{
                        // error_code=0表示需要开始轮询
                        if (res.error_code==0){
                            times_bar = 0;
                            removeLog();//防止轮询提交重复日志
                            checkBarOrderStatus($this);
                        }else{
                            bar_pay=false;
                            $this.removeClass("forbid").val("确定");
                        }
                        addLog({operate_text:"payWithBarCode",operate_info_text:"条码支付轮询中",error_text:res});
                        $(".error_txt").text(res.error_text);
                    }
                },function(res){
                    $this.removeClass("forbid").val("确定");
                    bar_pay = false;
                    $(".error_txt").text("支付数据提交失败，请刷新后重试 ("+res.status+" "+JSON.parse(res.responseText).error_text+")");
                    addLog({operate_text:"payWithBarCode",operate_info_text:"条码支付失败",error_text:res.status+" "+JSON.parse(res.responseText).error_text});
                },function(){
                    $this.removeClass("forbid").val("确定");
                    bar_pay = false;
                    $(".error_txt").text("无网络或请求超时，请检查网络连接后重试");
                    addLog({operate_text:"payWithBarCode",operate_info_text:"条码支付超时"});
                },10000);
            }
        }
    }
}
//轮询条码支付
function checkBarOrderStatus($obj){
    addLog({operate_text:"checkBarOrderStatus",operate_info_text:"条码支付轮询"});
    var url = "/accountant/home";
    var action = 'check_orderstatus';
    var $orderBox = $("#fruit_pay_menu");
    var args={
        action:action,
        if_payback:0,
        front_end_pay_id:$orderBox.attr("data-ordercode"),
        last_update_timestamp:$orderBox.attr("data-time"),
        log:getLog()
    };
    bar_pay = true;
    $.postJson(url,args,function(res){
        removeLog(); //防止轮询提交重复日志
        if(res.success){
            if(res.print_body){
                printTicket(res.print_body);
            }
            $obj.removeClass("forbid");
            bar_pay = false;
            var form_money = $("#fruit_pay_money").text();
            finishPay("扫码",form_money);
        }else{
            if(res.error_code==1||res.error_code==2){
                $orderBox.find(".error_txt").text(res.error_text);
                bar_pay=false;
                $obj.removeClass("forbid").val("确定");
            }else{
                times_bar++;
                if(times_bar<20){
                    var show_msg=res.error_text+'还需等待'+(20-times_bar)*3+'秒';
                    $orderBox.find(".error_txt").text(show_msg);
                    setTimeout(function(){
                        checkBarOrderStatus($obj);
                    },3000);
                }else{
                    times_bar=0;
                    bar_pay = false;
                    $obj.removeClass("forbid").val("确定");
                    $orderBox.find(".error_txt").text("扫码支付超时，若用户已支付完成或正在支付中，请点击确定按钮");
                }
                addLog({operate_text:"checkBarOrderStatus",operate_info_text:"条码支付轮询fail，继续轮询",error:res,times_bar:times_bar});
            }
        }
    },function(){
        times_bar++;
        if(times_bar<20){
            var show_msg='支付进行中，还需等待'+(20-times_bar)*3+'秒';
            $orderBox.find(".error_txt").text(show_msg);
            setTimeout(function(){
                checkBarOrderStatus($(".fruit_pay_code_btn"));
            },3000);
        }else{
            times_bar=0;
            bar_pay = false;
            $obj.removeClass("forbid").val("确定");
            $orderBox.find(".error_txt").text("扫码支付超时，若用户已支付完成或正在支付中，请点击确定按钮");
        }
        addLog({operate_text:"checkBarOrderStatus",operate_info_text:"条码支付轮询失败，继续轮询",times_bar:times_bar});
    },function(){
        times_bar++;
        if(times_bar<13){
            var show_msg='支付进行中，还需等待'+(13-times_bar)*5+'秒';
            $orderBox.find(".error_txt").text(show_msg);
            setTimeout(function(){
                checkBarOrderStatus($(".fruit_pay_code_btn"));
            },3000);
        }else{
            times_bar=0;
            bar_pay = false;
            $obj.removeClass("forbid").val("确定");
            $orderBox.find(".error_txt").text("扫码支付超时，若用户已支付完成或正在支付中，请点击确定按钮");
        }
        addLog({operate_text:"checkBarOrderStatus",operate_info_text:"条码支付轮询超时，继续轮询",times_bar:times_bar});
    },5000);
}
//调用设备扫码功能
function getShopScan(){
    if(navigator.userAgent.indexOf("senguo:cashierapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbillapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbossapp")>=0){
        try{
            window.Assistant.scanQrString("barcodeScanBack");
        }catch(e){
            Tip("当前APP版本过低，请前往个人中心更新");
        }
    }
}
//扫码回调方法
function barcodeScanBack(code){
    if(code){
        $("#fruit_pay_code_input").val(code);
        barCodePay($(".fruit_pay_code_btn"));
    }else{
        Tip("扫码失败，请重新扫码");
    }
}
// 收款获取通用参数
function get_balance_params(){
    var $orderBox = $("#fruit_pay_menu");
    var total_price = $orderBox.find("#fruit_pay_money").text();  //订单实际价格
    var fact_total_price = $orderBox.find("#fruit_pay_money").text(); //订单实际价格
    var sale_record_ids = [];
    sale_record_ids.push($orderBox.attr("data-record-id"));
    var balance_args = {
        accountant_id:$orderBox.attr("data-user-id"),
        front_end_pay_id:$orderBox.attr("data-ordercode"), //订单id
        last_update_timestamp:$orderBox.attr("data-time"), //结算时间戳
        if_payback:0,
        fact_total_price:fact_total_price,
        total_price:total_price,
        sale_record_ids:sale_record_ids,                    //流水号
        log:getLog()                                       //订单日志
    }
    return balance_args;
}
//生成临时订单号
function newTempOrder(){
    var $orderBox = $("#fruit_pay_menu");
    var timer = (new Date().getTime())+"";
    var front_end_pay_id = "LS"+timer;
    $orderBox.attr("data-ordercode",front_end_pay_id);
    var last_update_timestamp  = new Date().getTime();
    $orderBox.attr("data-time",last_update_timestamp);
    addLog({operate_text:"newTempOrder",operate_info_text:"前端新建订单",front_end_pay_id:front_end_pay_id});
}
//localstorage日志记录
function addLog(operate_obj){
    var $orderBox = $("#fruit_pay_menu");
    var record_data = {
        "front_end_pay_id":operate_obj.front_end_pay_id,
        "local_time":new Date().Format("yyyy-MM-dd HH:mm:ss"),
        "opearte_obj":operate_obj,
        "cashier_name":$orderBox.attr("data-user-name"),
        "shop_name":$orderBox.attr("data-shop-name"),
        "source":"bossApp"
    };
    var record_id = new Date().getTime();
    if(window.localStorage){
        var storage = window.localStorage,cashierLog={};
        if(storage.getItem("cashierLog")){
            cashierLog = JSON.parse(storage.getItem("cashierLog"));
        }
        cashierLog[record_id] = record_data;
        storage.setItem("cashierLog",JSON.stringify(cashierLog));
    }
}
function getLog(){
    var cashierLog="{}";
    if(window.localStorage){
        var storage = window.localStorage;
        if(storage.getItem("cashierLog")){
            cashierLog = storage.getItem("cashierLog");
        }
    }
    return cashierLog;
}
function removeLog(){
    if(window.localStorage){
        var storage = window.localStorage;
        storage.removeItem("cashierLog");
    }
}
//日期格式化
Date.prototype.Format = function (fmt){
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}