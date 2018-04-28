var regx_money = /^[0-9]\d*(\.\d{0,2})?$/,ERROR_TXT = "服务器出错了，请联系森果客服",
    TIMEOUT_TXT = "链接服务器超时，请检查您的网络";
$(document).ready(function(){
	//fastclick initialise
    FastClick.attach(document.body);
    $(".pop-bwin").on("click",function(e){/*关闭模态框*/
        if($(e.target).closest(".pop-content").length==0 && $(e.target).closest(".wrap-address-list").length==0 && $(e.target).closest(".entering-goods-content").length==0 && $(e.target).closest(".keyboard-nav").length==0){
            PopWin.hide($(".pop-bwin"));
        }
    });
    $(".goback").on("touchstart",function(){
        history.go(-1);
    });
    // ifStaffPermission();//判断管理员权限
}).on("click",".developing",function(){
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
    PopWin.hide($(this).closest(".pop-bwin"));
}).on("touchstart",".grey_btn",function(){
    if(!$(this).hasClass("forbid")){
        $(this).addClass("tdgrey-hover");
    }
}).on("touchend",".grey_btn",function(){
    $(this).removeClass("tdgrey-hover");
});
var PERMISSION_LIST_STATUS={};//管理员权限状态
function ifStaffPermission(){
    for(var key in PERMISSION_LIST){
        var permission=PERMISSION_LIST[key];
        if(permission=="addeditstaff"){//添加编辑员工
            PERMISSION_LIST_STATUS.addeditstaff=true;
        }else if(permission=="supplierclearing"){//货款结算
            PERMISSION_LIST_STATUS.supplierclearing=true;
        }else if(permission=="editreceipt"){//小票设置
            PERMISSION_LIST_STATUS.editreceipt=true;
        }else if(permission=="dataexport"){//数据导出
            PERMISSION_LIST_STATUS.dataexport=true;
        }else if(permission=="addgoods"){//添加货品
            PERMISSION_LIST_STATUS.addgoods=true;
        }else if(permission=="editgoods"){//编辑货品
            PERMISSION_LIST_STATUS.editgoods=true;
        }else if(permission=="editsupplier"){//编辑供货商信息
            PERMISSION_LIST_STATUS.editsupplier=true;
        }
    }
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

// 动画函数
var boo=0;
var canUse=document.getElementsByTagName("body")[0].style;
if(typeof canUse.animation!="undefined"||typeof canUse.WebkitAnimation!="undefined"){
    boo=1;/*支持动画*/
}else{
    boo=0;/*不支持动画*/
}

/*obj,actionName,speed都是 string,time(秒)是int类型*/
function actionIn(obj,actionName,time,speed){
    $(obj).show();
    if(boo==1)$(obj).css({"animation":actionName+" "+time+"s"+" "+speed,"animation-fill-mode":"forwards"});
}

function actionOut(obj,actionName,time,speed){
    if(boo==1){
        $(obj).css({"animation":actionName+" "+time+"s"+" "+speed});
        var setInt_obj=setInterval(function(){
            $(obj).hide();
            clearInterval(setInt_obj);
        },time*1000);
    }else $(obj).hide();
}