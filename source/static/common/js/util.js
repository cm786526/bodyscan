/*global tip*/
var zb_timer = null;
function Tip(text, time ,bgcolor){
    clearTimeout(zb_timer);
    if($("#zb-tip").size()>0){
        $("#zb-tip").html(text).removeClass("hidden zb-black");
    }else{
        var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
        $("body").append(tip);
    }
    if(bgcolor){
        $("#zb-tip").addClass(bgcolor);
    }
    var tip_time=time||2000;
    zb_timer = setTimeout(function(){
        $("#zb-tip").addClass("hidden");
    },tip_time);
}
/*获取滑动方向，touch*/
var touch = {
    getSlideAngle:function(dx, dy){
        return Math.atan2(dy, dx) * 180 / Math.PI;
    },
    getSlideDirection:function(startX, startY, endX, endY){
        var _ = this;
        var dy = startY - endY;
        var dx = endX - startX;
        var result = 0;
        //如果滑动距离太短
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
            return result;
        }
        var angle = _.getSlideAngle(dx, dy);
        if (angle >= -45 && angle < 45) {
            result = 4;
        } else if (angle >= 45 && angle < 135) {
            result = 1;
        } else if (angle >= -135 && angle < -45) {
            result = 2;
        }
        else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
            result = 3;
        }
        return result;
    }
};
var cookie={
    //name是cookie中的名，value是对应的值，days是多久过期（单位为天）,path:设置cookie作用域
    setCookie:function(name,value,days){
        var iTime=arguments[2]?arguments[2]:30; //此 cookie 将被保存 30 天
        var oDate = new Date();
        oDate.setTime(oDate.getTime()+iTime*24*3600*1000);
        document.cookie = name+"="+value+";path=/;expires="+oDate.toGMTString();
    },
    getCookie:function(name){
        var arr = document.cookie.split("; ");
        for(var i=0; i<arr.length; i++){
            if(arr[i].split("=")[0] == name){
                return arr[i].split("=")[1];
            }
        }
        //未找到对应的cookie则返回空字符串
        return '';
    },
    removeCookie:function(name){
        if(name.indexOf(",")==-1){
            this.setCookie(name,1,-1);
        }else{
            var arr = name.split(",");
            for(var i=0; i<arr.length; i++){
                this.setCookie(arr[i],1,-1);
            }
        }
    }
};
//判断是否是ios
function isIos(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/iPad/i)=="ipad" || ua.match(/iPhone/i)=="iphone"){
        return true;
    }else{
        return false;
    }
}
//判断微信浏览器
function isWeiXin(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
}
//判断是否是空对象
function isEmptyObj(obj){
    for(var n in obj){return false;}
    return true;
}
/*post*/
$.postJson = function(url, args, successCall, failCall, outline, timeout){
    args._xsrf = window.dataObj._xsrf;
    var _failCall;
    _failCall = function (res){
        // 服务器返回
        if(res.readyState == 4){
            // 登录超时
            if(res.responseText && (typeof res.responseText == "string") && res.responseText.length>0 && (res.responseText)[0]=="{" && JSON.parse(res.responseText).error_code && JSON.parse(res.responseText).error_code==4031){
                var responseText = JSON.parse(res.responseText);
                Tip(responseText.error_text);
                setTimeout(function() {
                    window.location.href = "/login?next="+responseText.error_redirect;
                },1500);
            }else{
                if(failCall){
                    failCall(res);
                }else{
                    return Tip("请求失败 ("+res.status+" "+res.statusText+")");
                }
            }
        // 网络返回
        }else{
            if(outline){
                outline(res);
            }else{
                // Tip("无网络或请求超时，请检查您的网络是否正常 ("+res.statusText+")");
            }
        }
    };
    var req = $.ajax({
        type:"post",
        url:url || window.location.href,
        data:JSON.stringify(args),
        contentType:"application/json; charset=UTF-8",
        timeout:timeout || 30000,
        success:successCall,
        fail:_failCall,
        error:_failCall
    });
};
/*get*/
$.getJson = function(url, successCall, failCall, outline, timeout){
    var _failCall;
    _failCall = function (res){
        // 服务器返回
        if(res.readyState == 4){
            // 登录超时
            if(res.responseText && (typeof res.responseText == "string") && res.responseText.length>0 && (res.responseText)[0]=="{" && JSON.parse(res.responseText).error_code && JSON.parse(res.responseText).error_code==4031){
                var responseText = JSON.parse(res.responseText);
                Tip(responseText.error_text);
                setTimeout(function() {
                    window.location.href = "/login?next="+responseText.error_redirect;
                },1500);
            }else{
                if(failCall){
                    failCall(res);
                }else{
                    return Tip("请求失败 ("+res.status+" "+res.statusText+")");
                }
            }
        // 网络返回
        }else{
            if(outline){
                outline(res);
            }else{
                // Tip("无网络或请求超时，请检查您的网络是否正常 ("+res.statusText+")");
            }
        }
    };
    var req = $.ajax({
        type:"get",
        url:url || window.location.href,
        contentType:"application/json; charset=UTF-8",
        timeout:timeout || 30000,
        success:successCall,
        fail:_failCall,
        error:_failCall
    });
};
function mathFloor(target){
    return Math.floor(target*100)/100;
}

function mathFloat(target){
    return Math.round(target*100)/100;
}
//上传图片时去掉域名
function replaceQiniu(imgurl){
    if(imgurl){
        return imgurl.replace('https://odhm02tly.qnssl.com/','');
    }else{
        return '';
    }
}

function replaceUrl(name, value){
    var url=window.location.href ;
    var newUrl="";
    var reg = new RegExp("(^|)"+ name +"=([^&]*)(|$)");
    var tmp = name + "=" + value;
    if(url.match(reg) != null){
        newUrl= url.replace(reg,tmp);
    }else{
        if(url.match("[\?]")){
            newUrl= url + "&" + tmp;
        }else{
            newUrl= url + "?" + tmp;
        }
    }
    window.history.replaceState({},"",newUrl);
}
(function ($) {
    $.getUrlParam = function (name, default_value) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return '';
    };
})($);
//防抖
function debounce(fn, args, delay) {
    var _delay = delay || 300;  //频率
    if (fn.timer) {
        clearTimeout(fn.timer);
    }
    fn.timer = setTimeout(function() {
        fn.call(this, args);
    }, _delay);
}

// 比较两个日期的大小
function CompareDate(d1,d2){
    return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
}