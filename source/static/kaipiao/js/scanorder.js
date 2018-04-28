$(document).ready(function(){
    var height=$(window).height();
    $(".container").css("height",height+"px");
    var goodsnum=record_info_list.length;
    if(goodsnum>0){
        for(var i=0;i<goodsnum;i++){
            var record=record_info_list[i];
            var record_num=record.record_num;
            var goods_name=record.goods_name;
            var commission_mul=record.commission_mul;
            if(goodsnum==1){//1单1品
                $(".record_num").text(record_num);
                $(".single-goods").removeClass("hide");
                $(".goods_name").text(goods_name);
                $(".commission_mul").text(commission_mul);
            }else{//1单多品
                $(".record_num").text($("#container").attr("data-recordnum"));
                var str='<p><span>'+goods_name+'</span><span class="ml10">'+commission_mul+'件</span></p>'
                $(".multi-goods").append(str).removeClass("hide");
            }
        }
        $(".record_num").removeClass("hide")
        $(".success-info").removeClass("hide");
        $(".wrap-back-btn").removeClass("mt60");
        $(".icon_flag").removeClass("icon-fail").addClass("icon-success");
        $(".notice_str").removeClass("color-pink").addClass("color-green");
        $(".wrap-check-refund").removeClass("hide");//退款退货
    }
    textToAudioForAndroid($(".notice_str").text());
}).on("click",".sure-customer-goods",function(){
    sureGoods();
}).on("click",".goods_scan",function(){
    scanQRCode();
}).on("click",".btn_check_refund",function(){
    $(".pop-refund-check").removeClass("hide");
}).on("click",".sure_refund_check",function(){
    sureRefund();
});
function sureGoods(){
    var url='';
    var args={
        action:'pick'
    };
    $.postJson(url,args,function(res){
        if(res.success){
            Tip("成功确认");
            setTimeout(function(){
                window.location.href="/salersman/home?tab=2";
            },500);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
function sureRefund(){
    var url='';
    var args={
        action:'refundcheck'
    };
    $.postJson(url,args,function(res){
        if(res.success){
            Tip("成功确认退款退货");
            setTimeout(function(){
                window.location.href="/salersman/home?tab=2";
            },500);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}