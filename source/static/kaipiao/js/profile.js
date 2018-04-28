$(document).ready(function(){
}).on("click",".ok_phone",function(){
    changePhone($(this));
}).on("click",".ok_password",function(){
    updatePassword($(this));
}).on("click",".reset_phone",function(){
    $("#phone,#code").val("");
    $(".pop-phone").removeClass("hide");
    $("#phone").focus();
}).on("click",".reset_password",function(){
    if($(".user_phone").text()=="无"){
        return Tip("请先绑定手机号");
    }
    $("#pass_code,#new_password,#new_password2").val("");
    $(".pop-password").removeClass("hide");
}).on("click",".get_code",function(){
    var $phone = $("#phone"), $code = $("#code");
    if(!$(".pop-password").hasClass("hide")){
        $phone = $("#pass_phone"), $code = $("#pass_code");
    }
    getVerifyCode($(this), $phone, $code);
}).on("click",".about_senguo",function(){
    window.location.href="https://i.senguo.cc/msadmin/about?type=pf";
});

function changePhone($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var phone= $.trim($('#phone').val());
    var code= $.trim($('#code').val());
    var regPhone=/^(1)\d{10}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(code.length!=4){
        return Tip("请输入正确的验证码");
    }
    var url='/common/profile';
    var args={
        action:"modify_phone",
        phone: phone,
        code: code
    };
    $obj.addClass('forbid').text('绑定中');
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('完成');
        if(res.success){
            Tip("手机号更换成功");
            $(".user_phone").text(phone);
            $("#pass_phone").val(phone);
            $(".pop-phone").addClass("hide");
            $(".check_phone_title").removeClass("red-txt f16");
            $(".check_phone_txt").text("更换");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('完成');
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass('forbid').text('完成');
        Tip(TIMEOUT_TXT);
    });
}
function updatePassword($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var code= $.trim($('#pass_code').val());
    var password = $.trim($('#new_password').val());
    var password2 = $.trim($('#new_password2').val());
    if(code.length!=4){
        return Tip("请输入正确的验证码");
    }
    if(password==""){
        return Tip("请输入密码");
    }
    if(password!=password2){
        return Tip("两次密码不一致，请重新输入密码");
    }
    var url='/common/profile';
    var args={
        action:'modify_password',
        password:password,
        code:code
    }
    $obj.addClass('forbid').text('重置中');
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('完成');
        if(res.success){
            Tip("密码重置成功");
            $(".pop-password").addClass("hide");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('完成');
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass('forbid').text('完成');
        Tip(TIMEOUT_TXT);
    });
}
//获取验证码
function getVerifyCode($obj, $phone, $code){
    if($obj.hasClass("forbid")){
        return false;
    }
    var url="/common/logincode";
    var action=$obj.attr("data-action");
    var phone = $.trim($phone.val());
    var regPhone=/^(1)\d{10}$/;
    var args={
        action:action
    };
    if(action=="modify_password"){  //修改密码
        url="/common/logincode"
        args.phone = phone;
    }else{
        args.phone = phone;
    }
    if(!regPhone.test(phone)){
        return Tip("手机号必须为11位数字");
    }
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





