$(document).ready(function(){
    wxLogin();
});
var lcode_time= 0,codeTimer=null;
function clearTimer(){
    clearInterval(codeTimer);
    lcode_time=0;
}
function wxLogin(){
    var url='/login';
    var args={
        action:'get_wx_ticket',
        v:new Date().getTime()
    };
    $('#code2').empty();
    $.postJson(url,args,function(res){
        if(res.success){
            var scene_id  = res.scene_id;
            var ticket_url= res.ticket_url;
            codeTimer=setInterval(function(){//计时
                lcode_time++;
            },1000);
            var $obj = $('#code2');
            $obj.qrcode({render:"canvas",width:160,height:160,text:ticket_url,typeNumber:-1, background: "#ECF1EF"});
            checkWxLogin(scene_id);
        }else {
            return Tip(res.error_text);
        }
    });
}
function checkWxLogin(scene_id){
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
                window.location.href="/register";
            }else{
                if(lcode_time>900){//15分钟过期
                    clearTimer();
                    alertShow("二维码已过期，请刷新页面");
                    return false;
                }else{
                    setTimeout(function(){
                        checkWxLogin(scene_id);
                    },1000);
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
