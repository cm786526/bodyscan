$(document).ready(function(){

}).on('click','#btn-submit-me',function(){
    //提交个人中心表单
    var $meDiv = $('#form-me');
    //通过ajax提交请求
    $.ajax({
        type: 'post',
        url: '/common/profile',
        data: {
            action:"add_admin_request",
            admin_name: $meDiv.find('#Me-Input1').val(),
            admin_idnumber: $meDiv.find('#Me-Input2').val(),
            admin_sex:$meDiv.find('[value="option"]:checked').val(),
            admin_affiliation: $meDiv.find('#Me-Input3').val(),
            admin_describe: $meDiv.find('#Me-Input4').val(),
            admin_pic:$meDiv.find('#InputPic').val()
        },
        dataType:'json',
        success:function (result) {
            $meDiv.find('.help-block').html('上传成功');
            if(result.success){
                //个人资料提交成功
                Tip("成功修改个人资料");
                setTimeout(function(){
                    window.location.href = "/admin";
                },2000);
            }
        }
    })
})