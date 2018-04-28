var area = window.dataObj.area;
$(document).ready(function(){
    var uploader1 = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: 'add_business_img',
        container: 'business_img',
        max_file_size: '4mb',
        filters : {
            max_file_size : '4mb',//限制图片大小
            mime_types: [
                {title : "image type", extensions : "jpg,jpeg,gif,png"}
            ]
        },
        flash_swf_url: 'static/common/js/plupload/Moxie.swf',
        dragdrop: false,
        chunk_size: '4mb',
        domain: qiniu_domain,//在qiniu.min.js中配置
        uptoken: $("#token").val(),
        unique_names: false,
        save_key: false,
        auto_start: true,
        //resize: {width: 750},//压缩后上传
        init: {
            'FilesAdded': function (up, files) {
                $(".business_loading").removeClass("hide");
                var file = files[0];
                !function(){
                    previewImage(file,function(imgsrc){
                        $("#business_image").attr("src",imgsrc);
                        $("#business_img").find(".no-img-span").addClass("hide");
                        $("#business_img").find(".has-img").removeClass("hide");
                    });
                }();
            },
            'UploadProgress': function (up, file) {
            },
            'FileUploaded': function (up, file, info) {
                $(".business_loading").addClass("hide");
                $("#business_image").attr("url",qiniu_domain+file.id+".jpg");
            },
            'Error': function (up, err, errTip) {
                if (err.code == -600) {
                    Tip("图片大小不能超过4M哦");
                } else if (err.code == -601) {
                    Tip("图片格式不对哦，只能上传png、jpg格式图片");
                } else if (err.code == -200) {
                    Tip("当前页面过期，请刷新页面");
                } else {
                    Tip(err.code + ": " + err.message);
                }
                up.removeFile(err.file.id);
                $(".business_loading").addClass("hide");
            },
            'Key': function (up, file) {
                var key = file.id+".jpg";
                return key;
            }
        }
    });
    var uploader2 = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: 'add_shop_img',
        container: 'shop_img',
        max_file_size: '4mb',
        filters : {
            max_file_size : '4mb',//限制图片大小
            mime_types: [
                {title : "image type", extensions : "jpg,jpeg,gif,png"}
            ]
        },
        flash_swf_url: 'static/common/js/plupload/Moxie.swf',
        dragdrop: false,
        chunk_size: '4mb',
        domain: qiniu_domain,//在qiniu.min.js中配置
        uptoken: $("#token").val(),
        unique_names: false,
        save_key: false,
        auto_start: true,
        //resize: {width: 750},//压缩后上传
        init: {
            'FilesAdded': function (up, files) {
                $(".shop_loading").removeClass("hide");
                var file = files[0];
                !function(){
                    previewImage(file,function(imgsrc){
                        $("#shop_image").attr("src",imgsrc);
                        $("#shop_img").find(".no-img-span").addClass("hide");
                        $("#shop_img").find(".has-img").removeClass("hide");
                    });
                }();
            },
            'UploadProgress': function (up, file) {
            },
            'FileUploaded': function (up, file, info) {
                $("#shop_image").attr("url",qiniu_domain+file.id+".jpg");
                $(".shop_loading").addClass("hide");
            },
            'Error': function (up, err, errTip) {
                if (err.code == -600) {
                    Tip("图片大小不能超过4M哦");
                } else if (err.code == -601) {
                    Tip("图片格式不对哦，只能上传png、jpg格式图片");
                } else if (err.code == -200) {
                    Tip("当前页面过期，请刷新页面");
                } else {
                    Tip(err.code + ": " + err.message);
                }
                up.removeFile(err.file.id);
                $(".shop_loading").addClass("hide");
            },
            'Key': function (up, file) {
                var key = file.id+".jpg";
                return key;
            }
        }
    });
    setTimeout(function(){//关闭文件多选
        $(".moxie-shim").children("input").attr("capture","camera").attr("accept","image/jpg,image/jpeg,image/png").removeAttr("multiple");
    },500);
    //初始化省份
    for(var key in area){
        var $item=$('<li></li>');
        var city=area[key]['city'];
        var if_city;
        if(city) {
            if_city='1';//有子城市
        }else{
            if_city='0';
        }
        $item.attr({'data-code':key,'data-city':if_city}).text(area[key]['name']);
        $('#privince_list').append($item);
    }
}).on('click','#phoneLogin',function(){
    var $this=$(this);
    if($this.hasClass("bg-grey")){
        return false;
    }
    register($this);
}).on("click",".get_code",function(){
    getVerifyCode($(this));
}).on("click",".pop-city",function(e){
    if($(e.target).closest(".wrap-address-list").size()==0){
        $(".pop-city").addClass("hide");
    }
}).on("click","#privince_list li",function(){
    var if_city = parseInt($(this).attr("data-city"));
    var code = $(this).attr("data-code");
    var name = $(this).text();
    if(if_city==1){
        $(".choose-title").html("选择城市");
        $('#city_list').empty();
        var city=area[code].city;
        for(var k in city){
            var $item=$('<li></li>');
            $item.attr({'data-code':k}).html(city[k]['name']);
            $('#city_list').append($item);
        }
        $(".province").html(name).attr("data-code",code);
        $("#privince_list").addClass("hide");
        $("#city_list").removeClass("hide");
    }else{
        $(".address").attr("data-code",code);
        $(".province").html(name).attr("data-code",code);
        $(".city").html(name).attr("data-code",code);
        $(".pop-city").addClass("hide");
    }
}).on("click","#city_list li",function(){
    var code = $(this).attr("data-code");
    var name = $(this).text(), provinceCode = $("#province").attr("data-code");
    $(".address").attr("data-code",code);
    $(".city").text(name).attr("data-code",code);
    $("#city_list").addClass("hide");
    $(".pop-city").addClass("hide");
}).on("click",".province",function(){
    if($(this).hasClass("forbid")){
        return false;
    }
    $(".choose-title").html("选择省份");
    $("#city_list,#county_list").addClass("hide");
    $("#privince_list").removeClass("hide");
    $(".pop-city").removeClass("hide");
}).on("click",".city",function(){
    if($(this).hasClass("forbid")){
        return false;
    }
    $(".choose-title").html("选择省份");
    $("#city_list,#county_list").addClass("hide");
    $("#privince_list").removeClass("hide");
    $(".pop-city").removeClass("hide");
}).on("click",".register",function(){
    register($(this));
}).on("click",".register_again",function(){
    $(".pop-ifpass").addClass("hide");
});

function register($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var shop_name = $.trim($(".shop_name").val());
    if(shop_name=="" || shop_name.length>21){
        $(".shop_name").focus();
        return Tip("店铺名不能为空且不能超过20个字");
    }
    var city_code = $.trim($(".shop_address").attr("data-code"));
    if(!city_code){
        return Tip("请选择省份和城市");
    }
    var address = $.trim($(".shop_address").val());
    if(address==""){
        $(".address").focus();
        return Tip("请输入详细地址");
    }
    var business_img = $("#business_image").attr("url") || "";
    /*if(!business_img){
        return Tip("请上传营业执照");
    }*/
    var shop_img = $("#shop_image").attr("url") || "";
   /* if(!shop_img){
        return Tip("请上传门头照片");
    }*/
    var phone= $.trim($('#phone').val());
    var code= $.trim($('#code').val());
    var regPhone=/^(1)\d{10}$/;
    if(!regPhone.test(phone)){
        return Tip("请填写正确的手机号");
    }
    if(code.length!=4){
        return Tip("请输入正确的验证码");
    }
    var url='/register';
    var args={
        shop_name:shop_name,
        city_code:city_code,
        shop_address:address,
        business_license:replaceQiniu(business_img),
        shop_img:replaceQiniu(shop_img),
        phone: phone,
        code:code
    };
    $obj.addClass('forbid').text('注册中');
    $.postJson(url,args,function(res){
        $obj.removeClass('forbid').text('申请注册');
        if(res.success){
            Tip("注册成功");
            setTimeout(function(){
                window.location.reload(true);
            },1200);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass('forbid').text('申请注册');
        Tip("注册出错，请联系森果客服");
    },function(){
        $obj.removeClass('forbid').text('申请注册');
        Tip("网络链接超时，请检查您的网络后重试");
    });
}
/*转化图片为base64*/
function previewImage(file,callback){//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
    if(!file || !/image\//.test(file.type)) return; //确保文件是图片
    if(file.type=='image/gif'){//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader();
        fr.onload = function(){
            callback(fr.result);
            fr.destroy();
            fr = null;
        };
        fr.readAsDataURL(file.getSource());
    }else{
        var preloader = new mOxie.Image();
        preloader.onload = function() {
            preloader.downsize( 200,200 ,true);//先压缩一下要预览的图片,宽，高
            var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg',70) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load( file.getSource() );
    }
}

