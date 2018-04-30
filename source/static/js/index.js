$(function(){
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');

    //切换到注册面板
    $loginBox.find('a.colMint').on('click',function () {
        $registerBox.show();
        $loginBox.hide();
    });

    //切换到登录面板
    $registerBox.find('a.colMint').on('click',function () {
        $loginBox.show();
        $registerBox.hide();
    });

    //注册
    $registerBox.find('button').on('click',function () {
        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/login',
            data:{
                action:"usename_regist",
                username:$registerBox.find('[name="username"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val(),
            },
            dataType:'json',
            success:function (result) {
                $registerBox.find('.colWarning').html(result.message);
                if(!result.code){
                    //注册成功
                    setTimeout(function(){
                        $loginBox.show();
                        $registerBox.hide();
                    },1000);
                }
            }
        });
    });

    //登录
    $loginBox.find('button').on('click',function () {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/login',
            data: {
                action:"username_password",
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType:'json',
            success:function(result){
                $loginBox.find('.colWarning').html(result.error_text);
                if(result.success){
                    //登录成功
                    if(result.role===1){
                        window.location.href="/admin";
                    }
                    else if(result.role===2) {
                        window.location.href = "/operator";
                    }
                    else if(result.role===3) {
                        window.location.href = "/uploads";
                    }
                }
            }
        })
    });
    //退出
    $('#logout').on('click',function () {
        $.ajax({
            url:'/logout',
            success:function(result){
                if(!result.code){
                    window.location.reload();
                }
            }
        });
    })

});