/*提示框*/
var zb_timer = null;
function Tip(text,time){
    clearTimeout(zb_timer);
    if($("#zb-tip").size()>0){
        $("#zb-tip").html(text).removeClass("hidden");
    }else{
        var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
        $("body").append(tip);
    }
    var _time=1500;
    if(time){_time=time;}
    zb_timer = setTimeout(function(){
        $("#zb-tip").addClass("hidden");
    },_time);
}

/* Ajax */
(function ($) {
    $.getUrlParam = function (name, default_value) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return default_value || null;
    };
    $.postJson = function(url, args, successCall, failCall, outline, timeout){
        args._xsrf = window.dataObj._xsrf;
        var _failCall;
        _failCall = function (res){
            if($(".wrap-loading-box").size()>0 && !$(".wrap-loading-box").hasClass("hide")){
                $(".wrap-loading-box").addClass("hide");
            }
            // 服务器返回
            if(res.readyState == 4){
                // 登录超时
                if(res.responseText && (typeof res.responseText == "string") && res.responseText.length>0 && (res.responseText)[0]=="{" && JSON.parse(res.responseText).error_code && JSON.parse(res.responseText).error_code==4031){
                    var responseText = JSON.parse(res.responseText);
                    Tip(responseText.error_text);
                    setTimeout(function(){
                        window.location.href = "/login?next="+responseText.error_redirect;
                    },1500);
                }else{
                    if(failCall){
                        failCall(res);
                    }else{
                        return Tip("请求失败 ("+(res.status || "")+" "+(res.statusText || "")+")");
                    }
                }
            // 网络返回
            }else{
                if(outline){
                    outline(res);
                }else{
                    return Tip("无网络或请求超时，请检查您的网络是否正常 ("+(res.statusText || "")+")");
                }
            }
        };
        $.ajax({
            type:"POST",
            url:url || window.location.href,
            data:JSON.stringify(args),
            contentType:"application/json; charset=UTF-8",
            timeout:timeout || 30000,
            success:successCall,
            fail:_failCall,
            error:_failCall
        });
    };
    $.getItem = function(url, success) {
        $.ajax({
            url: url,
            type: "get",
            dataType: "html",
            success: success,
            error: function() {
                Tip("您的网络暂时不通畅，请稍后再试");
            },
            fail: function() {
                Tip("您的网络暂时不通畅，请稍后再试");
            }
        });
    };
})(jQuery);

/* Cookie */
function getCookie(key){
    var aCookie = document.cookie.split(";");
    for (var i=0; i < aCookie.length; i++){
        var aCrumb = aCookie[i].split("=");
        if (key === aCrumb[0].replace(/^\s*|\s*$/,"")){
            return unescape(aCrumb[1]);
        }
    }
    return '';
}
function SetCookie(name,value,days){
    var days=arguments[2]?arguments[2]:30; //此 cookie 将被保存 30 天
    var exp=new Date();    //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + days*86400000);
    document.cookie=name+"="+escape(value)+";path=/;expires="+exp.toGMTString();
}
function removeCookie(name){
    if(name.indexOf(",")==-1){
        SetCookie(name,1,-1);
    }else{
        var arr = name.split(",");
        for(var i=0; i<arr.length; i++){
            SetCookie(arr[i],1,-1);
        }
    }
}
/*数字*/
function Int(target){
    target=parseInt(target);
    return target;
}
//未登录 获取验证码
function getVerifyCode($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var url="/common/logincode", $phone = $("#phone"), $code = $("#code");  //登录账号
    if($(".pop-bindPhone").size()>0 && !$(".pop-bindPhone").hasClass("hide")){  //绑定手机号
        $phone = $("#bind_phone"), $code = $("#bind_code");
    }
    var action=$obj.attr("data-action");
    var phone = $.trim($phone.val());
    var regPhone=/^(1)\d{10}$/;
    if(!regPhone.test(phone)){
        return Tip("手机号必须为11位数字");
    }
    var args={
        action:action,
        phone:phone
    };
    $obj.addClass('forbid');
    $.postJson(url,args,function(res){
            if(res.success){
                code_time($obj);
                $code.focus();
            }else{
                Tip(res.error_text);
                $obj.removeClass('forbid');
            } 
        },
        function(){
            $obj.removeClass('forbid');
            Tip("获取验证码失败，请重试");
        },
        function(){
            $obj.removeClass('forbid');
            Tip("无网络或请求超时，请检查网络连接后重试");
        }
    );
}
var code_wait=60;
function code_time($obj) {
    if (code_wait == 0) {
        $obj.text("获取验证码").removeClass('forbid');
        code_wait = 60;
    }else{
        $obj.text("("+ code_wait +")秒").addClass('forbid');
        code_wait--;
        setTimeout(function() {
            code_time($obj);
        },1000);
    }
}
//上传图片时去掉域名
function replaceQiniu(imgurl){
    if(imgurl){
        return imgurl.replace('https://odhm02tly.qnssl.com/','');
    }else{
        return '';
    }
}