$(document).ready(function(){
    //fastclick initialise
    FastClick.attach(document.body);
}).on('click','.will-open',function(){
    Tip('该功能即将开放！');
});

var zb_timer = null;
function Tip(text){
    clearTimeout(zb_timer);
    if($("#zb-tip").size()>0){
        $("#zb-tip").html(text).removeClass("hidden");
    }else{
        var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
        $("body").append(tip);
    }
    zb_timer = setTimeout(function(){
        $("#zb-tip").addClass("hidden");
    },2000);
}
function getCookie(key){
    var aCookie = document.cookie.split("; ");
    for (var i=0; i < aCookie.length; i++){
        var aCrumb = aCookie[i].split("=");
        if (key == aCrumb[0]){
            return aCrumb[1];
        }
    }
    return '';
}

function SetCookie(name,value,days){
    var days=arguments[2]?arguments[2]:30; //此 cookie 将被保存 30 天
    var exp=new Date();    //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + days*86400000);
    document.cookie=name+"="+value+";path=/;expires="+exp.toGMTString();
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
//public
(function ($) {
    $.postJson = function(url, args,successCall, failCall, errorCall,alwaysCall){
        args._xsrf = window.dataObj._xsrf;
        $.ajax({
            type:"post",
            url:url || window.location.href,
            data:JSON.stringify(args),
            contentType:"application/json; charset=UTF-8",
            success:successCall,
            fail:failCall,
            error:errorCall
        });
};
})($);

function getItem(url,success){$.get(url,success);}

function Int(target){
    target=parseInt(target);
    return target;
}

function checkTime(i)
{
    if (i<10)
    {i="0" + i}
    return i
}

function mathFloat(target){
    return Math.round(target*100)/100;
}

function isEmptyObj(obj){
    for(var n in obj){return false}
    return true;
}

function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}
(function ($) {
    $.getUrlParam = function (name, default_value) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return default_value || null;
    }
})($);

//prevent 冒泡
function stopPropagation(e) {  
    e = e || window.event;  
    if(e.stopPropagation) { //W3C阻止冒泡方法  
        e.stopPropagation();  
    } else {  
        e.cancelBubble = true; //IE阻止冒泡方法  
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