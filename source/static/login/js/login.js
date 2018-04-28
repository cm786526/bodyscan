$(document).ready(function(){
    wxLogin();
}).on('click','#phoneLogin',function(){
    var $this=$(this);
    login($this);
}).on("click",".save-password",function(){
    $("#remeber_num").toggleClass("checked");
}).on("click",".get_code",function(){
    getVerifyCode($(this));
}).on("click",".login_type_tab>a",function(){
    if($(this).hasClass("active")){
        return false;
    }
    if($(".forbid").size()>0){
        Tip("正在数据请求中，请等待...",2000);
        return false;
    }
    var index = $(this).index();
    $(".login_type_tab>a").removeClass("active").eq(index).addClass("active");
    $(".ltab_box").addClass("hide").eq(index).removeClass("hide");
    if(index==2 || index==1){
        clearTimer();
    }else{
        wxLogin();
    }
}).on("click",".pop-win",function(e){
    /*if($(e.target).closest(".login-content").size()==0){
        if(!$(this).hasClass("pop-role")){
            $(this).closest(".pop-win").addClass("hide");
        }
    }*/
}).on("click","#phoneBind",function(){
    phoneBind($(this));
}).on("click","#phonePassword",function(){
    phonePassword($(this));
}).on("keyup","#password",function(e){
    var keycode = e.keyCode;
    if(keycode==13){
        phonePassword($("#phonePassword"));
    }
}).on("keyup","#code",function(e){
    var keycode = e.keyCode;
    if(keycode==13){
        login($("#phoneLogin"));
    }
}).on("click",".btn_refresh_qrcode",function(){//刷新二维码
    wxLogin();
});
//绑定手机号
function phoneBind($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var phone= $.trim($('#bind_phone').val());
    var code= $.trim($('#bind_code').val());
    var regPhone=/^(1)\d{10}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(code.length!=4){
        return Tip("请输入正确的验证码");
    }
    var url='/login';
    var args={
        action:"login_bind_phone",
        phone: phone,
        code:code
    };
    $obj.addClass('forbid').text('绑定中');
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('绑定手机号');
        if(res.success){
            checkRole(res);
        }else {
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('绑定手机号');
        Tip("绑定手机号出错，请联系森果客服");
    },function(){
        $obj.removeClass('forbid').text('绑定手机号');
        Tip("网络链接超时，请检查您的网络后重试");
    });
}
var lcode_time= 0,codeTimer=null;
function login($obj){
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
    $obj.addClass('forbid').text('登录中');
    var url='/login';
    var args={
        action:"phone_code",
        phone: phone,
        code:code
    };
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('登录');
        if(res.success){
            // checkRole(res);
            window.location.href=res.next_url;
        }else {
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('登录');
        Tip("登录出错，请联系森果客服");
    },function(){
        $obj.removeClass('forbid').text('登录');
        Tip("网络链接超时，请检查您的网络后重试");
    });
}
function phonePassword($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var phone= $.trim($('#account').val());
    var password= $.trim($('#password').val());
    var regPhone=/^(1)\d{10}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(password==""){
        return Tip("请输入密码");
    }
    $obj.addClass('forbid').text('登录中');
    var url='/login';
    var args={
        action:"phone_password",
        phone: phone,
        password:password
    };
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('登录');
        if(res.success){
            checkRole(res);
        }else {
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('登录');
        Tip("登录出错，请联系森果客服");
    },function(){
        $obj.removeClass('forbid').text('登录');
        Tip("网络链接超时，请检查您的网络后重试");
    });
}
function clearTimer(){
    clearInterval(codeTimer);
    lcode_time=0;
}
//登录后检查
function checkRole(res){
    var role = res.role_list, bind_wx = res.bind_wx, bind_phone = res.bind_phone,
        login_index = $(".login_type_tab>a.active").index();
    if(login_index==1){
        roleGo(role);
    }else if(login_index==2){
        if(bind_wx){
            roleGo(role);
        }else{//没有绑定微信的情况
            $(".pop-bindwx").removeClass("hide");
            wxLogin();
        }
    }else{
        if(bind_phone){
            roleGo(role);
        }else{//没有绑定手机号的情况
            $("#bind_phone,#bind_code").val("");
            $(".pop-bindPhone").removeClass("hide");
        }
    }
}
//不同角色跳转
function roleGo(role){
    if(role.length==0){
        // return Tip("您没有登录权限");
        window.location.href='/login/staffaddnotice';
    }else if(role.length==1){
        if(role[0]=="accountant"){
            window.location.href='/accountant/home';
        }else if(role[0]=="admin"){
            window.location.href='/boss/home';
        }else {
            return Tip("您不是收银员或管理员,请先联系管理员进行添加",5000);
        }
    }else{
        $(".pop-role").removeClass("hide");
    }
}
function wxLogin(){
    $(".wrap-qrcode-outtime").addClass("hide");
    var url='/login';
    var args={
        action:'get_wx_ticket',
        v:new Date().getTime()
    };
    if(!$(".pop-bindwx").hasClass("hide")){
        url = "/personalcenter";
        args.action="bind_wx_ticket";
    }
    $('#code2,#bind_code2').empty();
    $.postJson(url,args,function(res){
        if(res.success){
            var scene_id  = res.scene_id;
            var ticket_url= res.ticket_url;
            codeTimer=setInterval(function(){//计时
                lcode_time++;
            },1000);
            var $obj = jQuery('#code2');
            if(!$(".pop-bindwx").hasClass("hide")){
                $obj = $("#bind_code2");
            }
            $('#code2,#bind_code2').empty();
            $obj.qrcode({render:"canvas",width:160,height:160,text:ticket_url,typeNumber:-1, background: "#ECF1EF"});
            checkWxLogin(scene_id);
        }else {
            return Tip(res.error_text);
        }
    });
}
function checkWxLogin(scene_id){
    if($(".login_type_tab>a.active").index()!=0&&$(".pop-bindwx").hasClass("hide")) {//非扫码方式
        return false;
    }
    var url="/login";
    var args={
        action:"wx_ticket",
        scene_id:scene_id
    };
    $.postJson(url,args,function(res){
        if(res.success){
            var status=res.login;
            if(status){
                clearTimer();
                checkRole(res);
            }else{
                if(lcode_time>900){//15分钟过期
                    clearTimer();
//                    alertShow("二维码已过期，请刷新页面");
                    $(".wrap-qrcode-outtime").removeClass("hide");
                    return false;
                }else{
                    setTimeout(function(){
                        checkWxLogin(scene_id);
                    },2000);
                }
            }
        }else {
            clearTimer();
            Tip(res.error_text);
        }
    });
}
function alertShow(str){
    Tip(str,100000000);
}
