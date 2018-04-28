var regx_money = /^[0-9]\d*(\.\d{0,2})?$/,regx_int=/^\d+$/,ERROR_TXT = "服务器出错了，请联系森果客服",
    TIMEOUT_TXT = "链接服务器超时，请检查您的网络";
$(document).ready(function(){
    FastClick.attach(document.body);
    if(!window.localStorage){//如果不支持localStorage,提示更新版本
        $(".pop-version").removeClass("hide");
    }
    $(".pop-bwin").on("click",function(e){/*关闭模态框*/
        if($(e.target).closest(".pop-content").length==0 && $(e.target).closest(".wrap-kaipiao-goods-box").length==0 && $(e.target).closest(".pop_content").length==0){
            if($(e.target).closest(".pop-paytype").size()>0 && bar_pay==true){
                Tip("请等待支付完成");
                return false;
            }
            $(".pop-bwin").addClass("hide");
        }
    });
    $(".goback").on("click",function(){
        history.go(-1);
    });
    // clearOldLocalOrder();
    // ifStaffPermission();//判断开票员权限
}).on("touchend",".developing",function(){
    return Tip("该功能手机版正在开发中，请在电脑版中进行设置～");
}).on("touchstart",".finish_btn",function(){
    $(this).addClass("finish-btn-hover");
}).on("touchend",".cancel_btn",function(){
    $(this).removeClass("cancel-btn-hover");
}).on("touchstart",".cancel_btn",function(){
    $(this).addClass("cancel-btn-hover");
}).on("touchend",".finish_btn",function(){
    $(this).removeClass("finish-btn-hover");
}).on("touchstart",".green-btn",function(){
    if(!$(this).hasClass("forbid")){
        $(this).addClass("green-btn-hover");
    }
}).on("touchend",".green-btn",function(){
    $(this).removeClass("green-btn-hover");
}).on("click",".closewin",function(){
    if($(this).hasClass("fruit-pay-close") && bar_pay==true){
        Tip("请等待支付完成");
        return false;
    }
    $(this).closest(".pop-bwin").addClass("hide");
}).on("touchstart",".grey_btn",function(){
    if(!$(this).hasClass("forbid")){
        $(this).addClass("tdgrey-hover");
    }
}).on("touchend",".grey_btn",function(){
    $(this).removeClass("tdgrey-hover");
}).on("touchstart",".goods_cookie",function(){
    $(this).addClass("goods-cookie-hover");
}).on("touchend",".goods_cookie",function(){
    $(this).removeClass("goods-cookie-hover");
});

var PERMISSION_LIST_STATUS={};
function ifStaffPermission(){
    for(var key in PERMISSION_LIST){
        var permission=PERMISSION_LIST[key];
        if(permission=="addgoods"){//添加货品
            PERMISSION_LIST_STATUS.addgoods=true;
        }else if(permission=="editgoods"){//编辑货品
            PERMISSION_LIST_STATUS.editgoods=true;
        }
    }
}
//调用android播放数字键
function startAudio(key){
    if(navigator.userAgent.indexOf("senguo:cashierapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbillapp") >= 0||navigator.userAgent.indexOf("senguo:androidpfbossapp")>=0){
        try{
            window.Assistant.speak(key);
        }catch(e){
            Tip("当前APP版本过低，请前往个人中心更新");
        }
    }
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


//iOS页面加载完成后的回调,播放语音
function playSynthesize(){
    var str = "";
    if($(".scan_order_container").size()>0){
        str=$(".notice_str").text();
    }else if($(".kaipiao_container").size()>0){
        str=$(".goods_name").text();
    }
    if(str!=""){
        synthesize(str);
    }
}
//localstorage
function operateLocalOrder(args, type){
    if(window.localStorage){
        var storage = window.localStorage.getItem("localOrder"),localOrder = {};
        if(storage){
            localOrder = JSON.parse(storage);
        }
        if(type=="add"){
            if(localOrder[cur_localorder_id]){
                localOrder[cur_localorder_id][args.sale_record_id] = args;
            }else{
                localOrder[cur_localorder_id] = {};
                localOrder[cur_localorder_id][args.sale_record_id] = args;
            }
        }else if(type=="del"){
            delete localOrder[cur_localorder_id][args.sale_record_id];
            if(isEmptyObj(localOrder[cur_localorder_id])){
                delete localOrder[cur_localorder_id];
                if(isEmptyObj(localOrder)){
                    window.localStorage.removeItem("localOrder");
                    return false;
                }
            }
        }
        window.localStorage.setItem("localOrder",JSON.stringify(localOrder));
    }
}
//清除一单多品的旧数据
function clearOldLocalOrder(){
    if(window.localStorage){
        var if_clear = window.localStorage.getItem("ifClearOrder");
        if(!if_clear){//首次清除数据
            window.localStorage.removeItem("localOrder");
            window.localStorage.removeItem("ifOneOrder");
            window.localStorage.setItem("ifClearOrder","1");
        }
    }
}
//获取JSON数组长度
function getJSONLength(obj){
    var length = Object.keys(obj).length;
    return length;
}
var PopWin={
    show:function(target){
        target.removeClass("hide");
        ModalHelper.afterOpen();
    },
    hide:function(target){
        ModalHelper.beforeClose();
        target.addClass("hide");
    }
}
//解决滚动穿透
var ModalHelper = (function(bodyCls) {
    var scrollTop;
    return {
        afterOpen: function() {
            scrollTop = $(window).scrollTop();
            document.body.classList.add(bodyCls);
            document.body.style.top = -scrollTop + 'px';
        },
        beforeClose: function() {
            document.body.classList.remove(bodyCls);
            $(window).scrollTop(scrollTop);
        }
    };
})('modal-open');
