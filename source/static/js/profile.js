$(document).ready(function(){
    getResultPage();
}).on('click','.info_edit',function(){
    $(this).css('display','none');
    $(this).parent().parent().find('.info_show').css('display','none');
    $(this).parent().find('.info_sure').css('display','block');
    $(this).parent().parent().find('input').css('display','block');
}).on('click','.info_sure',function(){
    var $list = $('.info-set-list');
    var str = $("#logoImg")[0].src;
    $.ajax({
        type: 'post',
        url: '/common/profile',
        data: {
            action:"edit_profile",
            realname: $list.find('#Me-Input1').val(),
            id_number: $list.find('#Me-Input2').val(),
            organization: $list.find('#Me-Input3').val(),
            email: $list.find('#Me-Input4').val(),
            phone:$list.find('#Me-Input5').val(),
            wx_number:$list.find('#Me-Input6').val(),
            qq_number:$list.find('#Me-Input7').val(),
            signature:$list.find('#Me-Input8').val(),
            headimgurl:str
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                window.location.reload();
                $(this).css('display','none');
                $(this).parent().parent().find('.info_show').css('display','block');
                $(this).parent().find('.info_edit').css('display','block');
                $(this).parent().parent().find('input').css('display','none');
            }
        }
    })
}).on('change','#InputPic',function(ev){
    var file = ev.target.files[0];
    var filename = file.name;
    var formData = new FormData();
    formData.append("file",file,filename);
    var xhr = new XMLHttpRequest();
    url = 'http://bodyscan.com.cn:9999/fileupload?action=upload_img';
    xhr.open('post', url, true);
    xhr.send(formData);
    xhr.onload = function()
    {
        edit_headimg(filename);
    };
});

//提示框
function Tip(text){
    var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
    $("body").append(tip);
    zb_timer = setTimeout(function(){
        $("#zb-tip").remove();
    },2000);
}

//获取页面数据
function getResultPage(){
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
                $('.realname').text(data_dict["realname"]);
                $('.id_number').text(data_dict["id_number"]);
                $('.organization').text(data_dict["organization"]);
                $('.email').text(data_dict["email"]);
                $('.phone').text(data_dict["phone"]);
                $('.wx_number').text(data_dict["wx_number"]);
                $('.qq_number').text(data_dict["qq_number"]);
                $('.signature').text(data_dict["signature"]);
                $("#logoImg").attr("src",data_dict["headimgurl"]);
            }else{
                // Tip(res.error_text);
            }
        }
    });
}

// 编辑头像
function edit_headimg(filename){
    var img_url="../../../static/images/headimg/"+filename;
    $.ajax({
        type: 'post',
        url: '/common/profile',
        data: {
            action: 'edit_headimg',
            headimgurl:img_url
        },
        dataType:'json',
        success:function (res) {
            if(res.success){
               Tip("成功编辑头像");
               $("#logoImg").attr('src',img_url);
            }else{
                Tip(res.error_text);
            }
        }
    });
}