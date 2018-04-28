$(document).ready(function(){
    $(".container").css("minHeight",$(window).height());
    $(".container").css("overflow","hidden")
    $(".wrap-login-wx").css("height",$(window).height());
}).on("click","#finishBind",function(){
    bindPhone($(this),"bind");
}).on("click",".price_item_li",function(){
    $(".price_item_li").removeClass("hover-li");
    $(this).addClass("hover-li");
    $(this).find("input").focus();
}).on("click","body",function(e){
    var target = $(e.target);
    if(target.closest(".price_item_li").size()==0){
        $(".price_item_li").removeClass("hover-li");
    }
}).on("click",".get_code",function(){
    getVerifyCode($(this));
}).on("input propertychange","#code,#new_code",function(){
    var $finish_btn=$(this).closest(".wrap-login-box").find(".finish-btn");
    if($(this).val()==""){
        $finish_btn.addClass("forbid");
    }else{
        $finish_btn.removeClass("forbid");
    }
}).on("input propertychange","#password",function(){
    var $finish_btn=$(this).closest(".wrap-login-box").find(".finish-btn");
    if($(this).val()==""){
        $finish_btn.addClass("forbid");
    }else{
        $finish_btn.removeClass("forbid");
    }
}).on("click",".wx_login",function(){//微信授权登录
    wxLogin(false);
}).on("click","#phoneLogin",function(){
    login($(this));
}).on("click",".login_type_list>li",function(){
    if($(this).hasClass("active")){
        return false;
    }
    /*if($("#phoneLogin").hasClass("forbid")){
        return false;
    }*/
    var index = $(this).index();
    $(".login_type_list>li").removeClass("active").eq(index).addClass("active");
    if(index==0){
        $(".pass_type").removeClass("hide");
        $(".code_type").addClass("hide");
    }else{
        $(".pass_type").addClass("hide");
        $(".code_type").removeClass("hide");
    }
}).on("click",".go_login_password",function(){
    $(".wrap-login-wx").addClass("hide");
    $(".wrap-login-password").removeClass("hide");
}).on("click",".go_register_staff",function(){
    if($(".wrap-register-staff").hasClass("hide")){
        $(".wrap-login-wx").addClass("hide");
        $(".wrap-login-password").addClass("hide");
        $(".wrap-register-staff").removeClass("hide");
        $(".go_register_staff").text("直接登录");
    }else{
        $(".wrap-login-wx").removeClass("hide");
        $(".wrap-login-password").addClass("hide");
        $(".wrap-register-staff").addClass("hide");
        $(".go_register_staff").text("手机注册");
    }
}).on("click","#finishRegist",function(){
    phoneRegist($(this));
}).on('click', '.new_staff_success', function() {
    window.location.reload();
});
//新员工注册
function phoneRegist(target){
    if(target.hasClass("forbid")){
        return false;
    }
    var name = $.trim($('#new_name').val());
    var phone= $.trim($('#new_phone').val());
    var code = $.trim($('#new_code').val());
    var regPhone=/^(1)\d{10}$/, regCode=/^\d{4}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(!regCode.test(code)){
        return Tip("请填写正确的验证码");
    }
    if(name.length>10){
        return Tip("姓名不能超过10个字");
    }
    var url='/login';
    var args={
        action:"phone_regist",
        phone: phone,
        code:code,
        name:name
    };
    target.addClass('forbid');
    $.postJson(url,args,function(res){
            target.removeClass('forbid');
            if(res.success){
                Tip("注册成功");
                setTimeout(function(){
                    window.location.reload();
                },500);
            }else {
                return Tip(res.error_text,4000);
            }
        },
        function(){
            target.removeClass('forbid');
            Tip("请求失败，请联系森果客服");
        },
        function(){
            target.removeClass('forbid');
            Tip("无网络或请求超时，请检查网络连接后重试");
        }
    );
}
function wxLogin(flag){
    try{
        window.NativeApi.wxLogin(flag);
    }catch(e){
        Tip("暂无客户端授权");
    }
}
//获取验证码
function getVerifyCode($obj){
    if($obj.hasClass("get-verifycode-forbid")){
        return false;
    }
    var url="/common/logincode";
    var phone = $.trim($('#phone').val());
    var regPhone=/^(1)\d{10}$/;
    var action=$obj.attr("data-action");
    if($obj.attr("data-type") == "regist"){//注册
        phone = $.trim($('#new_phone').val());
    }
    if(!regPhone.test(phone)){
        return Tip("手机号必须为11位数字");
    }
    var args={
        action:action,
        phone:phone
    };
    $obj.addClass('get-verifycode-forbid');
    $.postJson(url,args,function(res){
            if(res.success){
                code_time($obj);
                $("#code").val("").focus();
            }else{
                Tip(res.error_text);
                $obj.removeClass('get-verifycode-forbid');
            }
        },
        function(){
            $obj.removeClass('get-verifycode-forbid');
            Tip("获取验证码失败，请重试");
        },
        function(){
            $obj.removeClass('get-verifycode-forbid');
            Tip("无网络或请求超时，请检查网络连接后重试");
        }
    );
}
var code_wait=60;
function code_time($obj) {
    if (code_wait == 0) {
        $obj.text("发送").removeClass('get-verifycode-forbid');
        code_wait = 60;
    }else{
        $obj.text("("+ code_wait +")秒").addClass('get-verifycode-forbid');
        code_wait--;
        setTimeout(function() {
            code_time($obj);
        },1000);
    }
}
function bindPhone(target){
    if(target.hasClass("forbid")){
        return false;
    }
    var name = $.trim($('#name').val());
    var phone= $.trim($('#phone').val());
    var code = $.trim($('#code').val());
    var regPhone=/^(1)\d{10}$/, regCode=/^\d{4}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(!regCode.test(code)){
        return Tip("请填写正确的验证码");
    }
    if(name.length>10){
        return Tip("姓名不能超过10个字");
    }
    var url='/login';
    var args={
        action:"login_bind_phone",
        phone: phone,
        code:code,
        name:name
    };
    target.addClass('forbid');
    $.postJson(url,args,function(res){
            target.removeClass('forbid');
            if(res.success){
                Tip("手机号绑定成功");
                setTimeout(function(){
                    // var next_url = get_next_url();
                    window.location.href=res.next_url;
                },1000);
            }else {
                return Tip(res.error_text);
            }
        },
        function(){
            target.removeClass('forbid');
            Tip("请求失败，请联系森果客服");
        },
        function(){
            target.removeClass('forbid');
            Tip("无网络或请求超时，请检查网络连接后重试");
        }
    );
}
function login(target){
    if(target.hasClass("forbid")){
        return false;
    }
    var phone= $.trim($('#phone').val());
    var regPhone=/^(1)\d{10}$/, regCode=/^\d{4}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    var index = $(".login_type_list>li.active").index();
    var next_action = get_pararm_next();
    var url='/login';
    var args={
        action:"phone_code",
        phone: phone,
        code:code,
        next:next_action
    };
    if(index==0){
        var password= $.trim($('#password').val());
        if(password==""){
            return Tip("请输入密码");
        }
        args.password = password;
        args.action = "phone_password";
    }else{
        var code = $.trim($('#code').val());
        if(!regCode.test(code)){
            return Tip("请填写正确的验证码");
        }
        args.code = code;
        args.action = "phone_code";
    }
    target.addClass('forbid');
    $.postJson(url,args,function(res){
            target.removeClass('forbid');
            if(res.success){
                var next_url=res.next_url
                window.location.href=next_url;
                // var next_url = get_next_url();
                // if(index==0){
                //     window.location.href=next_url;
                // }else{
                //     var bind_wx = res.bind_wx;
                //     if(bind_wx){
                //         window.location.href=next_url;
                //     }else{
                //         wxLogin(true);
                //     }
                // }
            }else{
                return Tip(res.error_text);
            }
        },
        function(){
            target.removeClass('forbid');
            Tip("请求失败，请联系森果客服");
        },
        function(){
            target.removeClass('forbid');
            Tip("无网络或请求超时，请检查网络连接后重试");
        }
    );
}

function get_pararm_next(){
    var next_action = $.getUrlParam("next");
    return next_action;
}

function get_next_url(){
    var next_action = get_pararm_next();
    if((next_action&&next_action=="mboss")||navigator.userAgent.indexOf("senguo:pfbossapp") >= 0){
        next_url = '/mboss/home';
    }else{
        next_url = '/salersman/home';
    }
    return next_url;
}