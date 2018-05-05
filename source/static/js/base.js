$(document).ready(function() {
    getPage();
}).on('mouseover','.image-div',function(){
    $('#nav-my-hidden').css('display','block');
    $('.image-div').css('background-color','#16344f');
}).on('mouseleave','#nav-my-hidden',function(){
    $('#nav-my-hidden').css('display','none');
    $('.image-div').css('background-color','#337ab7');
}).on('mouseover','#nav-my-hidden',function(){
    $('#nav-my-hidden').css('display','block');
    $('.image-div').css('background-color','#16344f');
}).on('mouseleave','.image-div',function(){
    $('#nav-my-hidden').css('display','none');
    $('.image-div').css('background-color','#337ab7');
});
//获取页面数据
function getPage(){
    $.ajax({
        type: 'post',
        url: '/common/profile',
        data: {
            action: 'get_profile'
        },
        dataType:'json',
        success:function (res) {
            if(res.success){
                data_dict=res.data_dict;
                $("#logoImg").attr("src",data_dict["headimgurl"]);
            }else{
                // Tip(res.error_text);
            }
        }
    });
}