$(document).ready(function(){
    getResultPage();
}).on('click','.info_edit',function(){
    $(this).css('display','none');
    $(this).parent().parent().find('.info_show').css('display','none');
    $(this).parent().find('.info_sure').css('display','block');
    $(this).parent().parent().find('input').css('display','block');
}).on('click','.info_sure',function(){
    var $list = $('.info-set-list');
    var str = $('#InputFile').val();
    var index = str.lastIndexOf("\\");
    str = str.substring(index + 1,str.length);
    $.ajax({
        type: 'post',
        url: '/common/profile',
        data: {
            action:"set_profile",
            admin_name: $list.find('#Me-Input1').val(),
            admin_idnumber: $list.find('#Me-Input2').val(),
            admin_affiliation: $list.find('#Me-Input3').val(),
            admin_email: $list.find('#Me-Input4').val(),
            admin_tel:$list.find('#Me-Input5').val(),
            admin_wx:$list.find('#Me-Input6').val(),
            admin_qq:$list.find('#Me-Input7').val(),
            admin_description:$list.find('#Me-Input8').val(),
            admin_pic:str
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                $(this).css('display','none');
                $(this).parent().parent().find('.info_show').css('display','block');
                $(this).parent().find('.info_edit').css('display','block');
                $(this).parent().parent().find('input').css('display','none');
            }
        }
    })
}).on('change','#InputPic',function(ev){
    var file = ev.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    var url = window.URL.createObjectURL(file);
    var img = new Image;
    img.src = url;
    var filename = file.name;
    var formData = new FormData();
    formData.append("file", filename);
    var xhr = new XMLHttpRequest();
    url = 'http://bodyscan.com.cn:9999/fileupload?action=chunk_upload';
    xhr.open('post', url, true);
    url = "/common/profile";
    var args = {
        action: 'upload_picture',
        file_name: filename
    };
    $.post(url, args, function(res){
        if(res.success){
            Tip("成功上传文件");
        }else{
            Tip(res.error_text);
        }
    });
    xhr.send(formData);
    var fil = this.files[0];
    reader = new FileReader();
    reader.readAsDataURL(fil);
    reader.onload = function()
    {
        $("#logoImg").attr('src',reader.result);
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
            action: 'upload_data'
        },
        dataType:'json',
        success:function (res) {
            if(res.success){
                Tip("成功上传文件");
            }else{
                // Tip(res.error_text);
            }
        }
    })
}