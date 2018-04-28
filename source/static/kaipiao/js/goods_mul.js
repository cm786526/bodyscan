var curLocalOrder = {}, cur_sale_record_id=0, cur_goods_id = 0, cur_localorder_id=0;
var $cur_order=null;//当前订单
$(document).ready(function(){
    getPrinters();
    getLocalOrder();
}).on("click",".change_print",function(){
    if($(this).hasClass("forbid_click")){
        Tip("暂无可切换打印机");
        return false;
    }
    $(".pop-change").removeClass("hide");
}).on("click",".tright_kp",function(){
    cur_localorder_id = $(this).closest(".order_item_li").attr("data-id");
    window.localStorage.setItem("cur_localorder_id",cur_localorder_id);
    var $obj = $(".change_plist>li.active");
    if($obj.size()==0){
        $(".cur_print_num").text("无");
    }else{
        if($(".print_-1").size()>0 && $(".print_-1").hasClass("active")){
            $(".cur_print_num").text("POS打印(pos)");
        }else{
            $(".cur_print_num").text($obj.attr("data-remark")+$obj.attr("data-num"));
        }
    }
    $(".pop-print").removeClass("hide");
}).on("click",".ok_print",function(){
    Tip("开票中...");
    orderKP($(this));
}).on("click",".mul-ogoods-list>li",function(){
    cur_localorder_id = $(this).closest(".order_item_li").attr("data-id");
    window.localStorage.setItem("cur_localorder_id",cur_localorder_id);
    var sale_record_id = $(this).attr("data-id");
    var order = curLocalOrder[cur_localorder_id][sale_record_id];
    $(".pgoods_name").text(order.goods_name);
    $(".supply_name").text("("+order.supply_name+")");
    $(".pgoods_count").text(order.commission_mul);
    $(".pgoods_total").text(order.receipt_money);
    $(".pgoods_unit").text(order.goods_unit);
    $(".singer_price").text(order.goods_price);
    $(".singer_total").text(order.singer_total);
    $(".hangfei").text(order.commission);
    $(".hangfei_total").text(order.hangfei_total);
    $(".yajin").text(order.deposit);
    $(".yajin_total").text(order.deposit_total);
    $(".pop-detail").removeClass("hide");
    cur_sale_record_id = sale_record_id;
    cur_goods_id = order.goods_id;
}).on("click",".del_goods",function(){
    $(".wrap-loading-box").removeClass("hide");
    operateLocalOrder(curLocalOrder[cur_localorder_id][cur_sale_record_id],"del");
    window.location.reload(true);
}).on("click",".edit_goods",function(){
    window.localStorage.setItem("ifOneOrder",1);
    window.localStorage.setItem("kp_supplier_id",1);
    window.location.href="/salersman/goodsSale/"+cur_goods_id+"?sale_record_id="+cur_sale_record_id;
}).on("click",".tright_add",function(){
    cur_localorder_id = $(this).closest("li").attr("data-id");
    window.localStorage.setItem("cur_localorder_id",cur_localorder_id);
    window.localStorage.setItem("ifOneOrder",1);
    window.location.href="/salersman/home?tab=2";
}).on("click",".close_search",function(){
    PopWin.hide($(".pop-search"));
}).on("click",".search_clear",function(){
    $(".page_search_ipt").val("").focus();
}).on("click",".tright_customer",function(){
    $cur_order=$(this).closest(".order_item_li");
    initSearchCustomer();
}).on("input propertychange",".page_search_ipt",function(){
    searchCustomer($(this));
}).on("click",".search_result_list>.item-customer",function(){
    var $this = $(this);
    var id = $this.attr("data-id");
    var name = $this.attr("data-name");
    var company = $this.attr("data-company")||"无单位";
    $cur_order.find(".tright_customer").addClass("hide");
    $cur_order.find(".btn_update_customer").removeClass("hide");
    $cur_order.find(".customer_company").text(company);
    $cur_order.find(".customer_name").text(name);
    PopWin.hide($(".pop-search"));
    var order_id = $cur_order.attr("data-id");
    curLocalOrder[order_id].customer_id = id;
    curLocalOrder[order_id].customer_name = name;
    curLocalOrder[order_id].customer_company = company;
    window.localStorage.setItem("localOrder",JSON.stringify(curLocalOrder));
}).on("click",".btn_update_customer",function(){
    $cur_order=$(this).closest(".order_item_li");
    $(".pop-update-customer").removeClass("hide");
}).on("click",".ok_update_customer",function(){
    $(".pop-update-customer").addClass("hide");
    clearCustomer();
    initSearchCustomer();
});
//清除当前客户
function clearCustomer(){
    $cur_order.find(".tright_customer").removeClass("hide");
    $cur_order.find(".btn_update_customer").addClass("hide");
    $cur_order.find(".customer_company").text("");
    $cur_order.find(".customer_name").text("");
    var order_id = $cur_order.attr("data-id");
    delete curLocalOrder[order_id].customer_id;
    delete curLocalOrder[order_id].customer_name;
    delete curLocalOrder[order_id].customer_company;
    window.localStorage.setItem("localOrder",JSON.stringify(curLocalOrder));
}
//初始化客户搜索
function initSearchCustomer(){
    PopWin.show($(".pop-search"));
    $(".page_search_ipt").attr("placeholder","输入客户姓名/单位搜索").val("").focus();
    $(".search_result_list").empty();
    $(".pop-search .search-txt-info").addClass("hide").find(".search_msg").text("");
}
//搜索客户
function searchCustomer($obj){
    var msg = $.trim($obj.val());
    if(msg==""){
        return false;
    }
    var args = {
        action:"search_customer",
        data:msg
    };
    $.postJson("/salersman/customersearch",args,function(res){
        if(res.success){
            $(".search_result_list").empty();
            var datalist = res.data_list;
            var len = datalist.length;
            if(len == 0){
                $(".no_result").removeClass("hide");
                $(".pop-search .search-txt-info").addClass("hide").find(".search_msg").text("");
            }else{
                $(".pop-search .search-txt-info").removeClass("hide").find(".search_msg").text(msg);
                $(".no_result").addClass("hide");
                for(var key in datalist){
                    var data=datalist[key];
                    var company=data.company||"无单位";
                    var str='<li class="item-customer" data-id="'+data.customer_id+'" data-name="'+data.name+'" data-company="'+data.company+'">'+
                        '                <span class="c999">姓名：</span><span>'+data.name+'</span>'+
                        '                <span class="fr mr10"><span class="c999">采购次数：</span><span>'+data.purchase_times+'次</span></span>'+
                        '                <p><span class="c999">单位：</span><span>'+company+'</span></p>'+
                        '            </li>';
                    $(".search_result_list").append(str);
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
function orderKP($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var local_print = 0;
    if($(".change_print").attr("data-id")=="-1"){
        local_print = 1;
    }
    var localOrders = JSON.parse(window.localStorage.getItem("localOrder"));
    var cur_order_args = localOrders[cur_localorder_id];
    var customer_id = cur_order_args.customer_id;
    delete cur_order_args.customer_id;
    delete cur_order_args.customer_name;
    delete cur_order_args.customer_company;
    var args = {
        action:"save_temp_order",
        data:cur_order_args,
        local_print:local_print,
        customer_id:customer_id
    };
    $obj.addClass("forbid");
    $(".wrap-loading-box").removeClass("hide");
    $.postJson("/salersman/goodsSaleMulti",args,function(res) {
        $obj.removeClass("forbid");
        $(".wrap-loading-box").addClass("hide");
        if(res.success) {
            if(res.print_body){
                printTicket(res.print_body);
            }
            if(window.location.href.indexOf("pifa")>0){ //打印单号用于本地调试
                console.log(res.multi_order_num);
            }
            Tip("开票成功");
            delete localOrders[cur_localorder_id];
            window.localStorage.setItem("localOrder",JSON.stringify(localOrders));
            $(".order_"+cur_localorder_id).remove();
            if($("#data_list>li").length==0){
                window.localStorage.removeItem("localOrder");
                window.localStorage.setItem("ifOneOrder",0);
                $(".no-result").removeClass("hide");
            }
            $(".pop-print").addClass("hide");
        }else{
            Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
        $(".wrap-loading-box").addClass("hide");
        $obj.removeClass("forbid");
    },5000);
}
function getLocalOrder(){
    var localOrder = window.localStorage.getItem("localOrder");
    if(localOrder=="{}" || !localOrder){
        $(".goods-mulorder-list").addClass("hide");
        $(".no-result").removeClass("hide");
    }else{
        localOrder = JSON.parse(localOrder);
        curLocalOrder = localOrder;
        $("#data_list").empty();
        $(".goods-mulorder-list").removeClass("hide");
        var index=0;
        for(var skey in localOrder){
            var localOrderItem = localOrder[skey], lis = "";
            if(isEmptyObj(localOrderItem)){//如果订单没有数据则退出这次循环(按说是不应该出现的)
                delete localOrder[skey];
                curLocalOrder = localOrder;
                if(isEmptyObj(localOrder)){
                    window.localStorage.removeItem("localOrder");
                    break;
                }else{
                    window.localStorage.setItem("localOrder",JSON.stringify(localOrder));
                }
                continue;
            }
            index++;
            var index_txt = index<10?("0"+index):index;
            lis += '<li class="mb8 order_item_li order_'+skey+'" data-id='+skey+'>'+
                '<div class="mulorder-top group">'+
                    '<div class="fl first-col-titem mt4">'+
                        '<span class="c666">序号</span>'+
                        '<p>'+index_txt+'</p>'+
                    '</div>'+
                    '<div class="fl second-col-titem mt4">'+
                        '<span class="c666">总金额</span>'+
                        '<p><span class="mul_total_price">0</span>元</p>'+
                    '</div>'+
                    '<div class="fl third-col-titem mt4 clip btn_update_customer hide">'+
                        '<span class="customer_company">客户单位</span>'+
                        '<p><span class="customer_name">客户姓名</span></p>'+
                    '</div>'+
                    '<a href="javascript:;" class="fr tright-btn tright-kp green-btn tright_kp">开票</a>'+
                    '<a href="javascript:;" class="fr tright-btn tright-add grey_btn tright_customer">客户录入</a>'+
                '</div>'+
                '<ul class="mul-ogoods-list">';
            var mul_total_price = 0;
            for(var key in localOrderItem){
                var order = localOrderItem[key];
                var sale_record_id = order.sale_record_id;
                if(!sale_record_id){  //为客户信息
                    continue;
                }
                var receipt_money = order.receipt_money,
                goods_name = order.goods_name,
                commission_mul = order.commission_mul,//件数
                sales_num = order.sales_num;
                mul_total_price += parseFloat(receipt_money);
                var second_col = sales_num+order.goods_unit;
                if(order.goods_unit=="件"){
                    second_col = "&nbsp;";
                }
                lis += '<li data-id='+sale_record_id+'>'+
                            '<span class="first-ocol">'+goods_name+'<span class="c999">('+order.supply_name+')</span></span>'+
                            '<span class="second-ocol">'+second_col+'</span>'+
                            '<span class="third-ocol">'+commission_mul+'件</span>'+
                            '<span class="firth-ocol">金额：'+receipt_money+'元</span>'+
                        '</li>';
            }
            lis += '</ul><div class="wrap-multi-addgoods grey_btn"><a href="javascript:;" class="multi-add-goods tright_add">+ 添加货品</a></div></li>';
            $("#data_list").append(lis);
            $(".order_"+skey).find(".mul_total_price").text(mathFloat(mul_total_price));
            var customer_id=localOrderItem.customer_id;
            var customer_name=localOrderItem.customer_name;
            var customer_company=localOrderItem.customer_company;
            if(customer_id){
                $(".order_"+skey).find(".tright_customer").addClass("hide");
                $(".order_"+skey).find(".btn_update_customer").removeClass("hide");
                $(".order_"+skey).find(".customer_company").text(customer_company);
                $(".order_"+skey).find(".customer_name").text(customer_name);
            }
        }
    }
}
