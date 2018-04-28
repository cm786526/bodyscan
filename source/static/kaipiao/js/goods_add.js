var goods_id = 0,new_goods_clone=null,$goods=null,$keyboard=null,goods_index= 0,$provider=null;
$(document).ready(function(){
    new_goods_clone=$(".new-goods-clone").clone();
    new_goods_clone.removeClass("new-goods-clone");
    goods_id = parseInt($(".container").attr("data-id"));
    if(goods_id>0){//商品编辑
        var unit = parseInt($(".container").attr("data-unit"));
        var commission = parseInt($(".container").attr("data-commission"));
        $(".unit-roll-btns>a").addClass("hide").removeClass("roll-btn-active").eq(unit).addClass("roll-btn-active").removeClass("hide");
        $(".price_unit").text($(".unit-roll-btns>a.roll-btn-active").text());
        if($(".commission_"+commission).size()==0){
            $(".commission_0").addClass("roll-btn-active");
        }else{
            $(".commission_"+commission).addClass("roll-btn-active");
        }
    }
    initUploadImg(0);
    getPrinters(); //获取打印机
}).on("click",".page-goods",function(){
    $goods=$(this);
}).on("click",".roll_btn",function(){
    $(this).addClass("roll-btn-active").siblings(".roll_btn").removeClass("roll-btn-active");
}).on("click",".finish_btn",function(){
    operateGoods($(this));
}).on("click",".goods_back,.cancel_btn",function(){
    if(confirm("确定取消此货品操作吗？")){
        var status = "";
        if(goods_id>0){
            status = "&status=2";
        }
        window.history.go(-1);
//        window.location.href="/salersman/home?tab=2"+status;
    }
}).on("click",".right_ipt_div",function(){
    $(this).find("input").focus();
}).on("click",".goods_name",function(){
    if($(this).hasClass("forbid_click")){
        return Tip("请在电脑端修改货品名称",3000);
    }
    $(".search_result_list").empty();
    PopWin.show($(".pop-search"));
    $(".page_search_ipt").attr("data-type","goods").val("").focus();
}).on("touchstart",".keyboard-tb td",function(){
    if(!$(this).hasClass("green-btn")){
        if($(this).hasClass("td-grey")){
            $(this).addClass("tdgrey-hover");
        }else{
            $(this).addClass("td-hover");
        }
    }
}).on("touchend",".keyboard-tb td",function(){
    if($(this).hasClass("td-grey")){
        $(this).removeClass("tdgrey-hover");
    }else{
        $(this).removeClass("td-hover");
    }
    var key = $(this).attr("data-key");
    startAudio(key);
    keyboardOperate($(this));
}).on("click",".pop-new-keyboard",function(e){
    var target = $(e.target);
    if(target.closest(".keyboard-nav").size()==0){
        $("#keyboard").addClass("hide");
    }
}).on("click",".search_result_list>li",function(){//选择供货商或商品
    var $this=$(this);
    if($this.hasClass("item-goods")){//商品
        var text = $this.text();
        $goods.find(".goods_name").text(text);
    }else{//供货商
        if($this.hasClass("to_new_provider")){
            $(".pop-addprovider").removeClass("hide");
        }else{
            var text = $this.text(), id = $this.attr("data-id");
            $goods.find(".supply_name").text(text).attr("data-id",id);
        }
    }
    PopWin.hide($(".pop-search"));
}).on("click",".close_search",function(){
    PopWin.hide($(".pop-search"));
    PopWin.hide($(".pop-goodsgroup"));
}).on("click",".search_supply",function(){
    if($(this).hasClass("forbid_click")){
        return Tip("供货商不能编辑");
    }
    $provider=$(this);
    $(".search_result_list").empty();
    PopWin.show($(".pop-search"));
    $(".page_search_ipt").attr("data-type","supply").val("").focus();
}).on("click",".search_clear",function(){
    $(".page_search_ipt").val("").focus();
}).on("input propertychange",".page_search_ipt",function(){
    searchSupply($(this));
}).on("click",".choose_unit",function(){//选择单位
    if($(this).hasClass("forbid_click")){
        return Tip("批发单位不能编辑");
    }
    $(".pop-unit").removeClass("hide");
}).on("click",".ok_goodsunit_btn",function(){
    var $unit=$(".unit-roll-btns .roll-btn-active");
    var unitid=$unit.attr("data-id");
    var unit=$unit.text();
    $goods.find(".choose_unit").attr("data-id",unitid).find(".unit_str").text(unit);
    $goods.find(".goods_unit").text("元/"+unit);
    $(".pop-unit").addClass("hide");
}).on("click",".goods-type",function(){//类型
    $(this).addClass("active").siblings(".goods-type").removeClass("active");
    if($(this).attr("data-id")==0){//自营
        $goods.find(".flag_provider").addClass("hide");
    }else{
        $goods.find(".flag_provider").removeClass("hide");
    }
}).on("click",".to_keyboard",function(){
    var $this=$(this);
    if($this.hasClass("disable_deposit")){
        return Tip("押金功能未开启");
    }
    if($this.hasClass("choose_deposit") && $this.attr("data-id") == 0){
        return Tip("该货品押金不允许修改");
    }
    if($this.hasClass("choose_storage")){//库存不允许直接手动修改
        if($this.hasClass("forbid_click")){
            Tip("暂不支持手动修改库存，可填写到货量增加库存",3000);
        }else{
            Tip("新货品库存请填写到货量",3000);
        }
        return false;
    }
    $keyboard=$this;
    var title=$keyboard.find(".title").text();
    var unit=$keyboard.find(".unit_str").text();
    var num=$keyboard.find(".num_str").text();
    if(num==0){num='';}
    $("#keyboard").removeClass("hide");
    $("#keyboard").find(".keyboard-title").text(title+"：");
    $("#keyboard").find(".keyboard-unit").text(unit);
    $("#keyboard").find(".keyboard-input").val('');
}).on("click",".keyboard_sure",function(){
    var val=$(".keyboard-input").val();
    $("#keyboard").addClass("hide");
    if(val==''){
        return false;
    }
    if($keyboard.hasClass("choose_commission")){//行费
        if(val == 0){
            $keyboard.find(".unit_str").addClass("hide");
            $keyboard.find(".num_str").attr("data-id",0).text("无");
        }else{
            $keyboard.find(".unit_str").removeClass("hide");
            $keyboard.find(".num_str").attr("data-id",val).text(val);
        }
    }else if($keyboard.hasClass("choose_stockin")){ //到货量
        if(val>0){
            $goods.find(".li_print_stockin").removeClass("hide");
        }else{
            $goods.find(".li_print_stockin").addClass("hide");
        }
        $keyboard.find(".num_str").text(val);
    }else{
        $keyboard.find(".num_str").text(val);
    }
}).on("click",".btn_new_goods",function(){//继续添加货品
    goods_index++;
    var new_goods=new_goods_clone.clone();
    if($(this).hasClass("btn_same_provider")){//相同供货商
        var $last=$(".wrap-goods-pages .page-goods").last().find(".supply_name");
        var provider=$last.text()||"选择供货商";
        var p_id=$last.attr("data-id");
        new_goods.find(".supply_name").text(provider).attr("data-id",p_id);
    }else if($(this).hasClass("btn_same_name")){//相同货品名称
        var $last=$(".wrap-goods-pages .page-goods").last().find(".goods_name");
        var goodsname=$last.text()||"选择货品";
        new_goods.find(".goods_name").text(goodsname);
    }
    new_goods.find(".add_img_area").attr("id","add_img_area_"+goods_index);
    new_goods.find(".add_img").attr("id","add_img_"+goods_index);
    $(".wrap-goods-pages").append(new_goods);
    initUploadImg(goods_index);
    $(".wrap-add-moregoods").removeClass("mt20");
}).on("click",".del_newgoods",function(){//删除
    $(this).closest(".page-goods").remove();
    if($(".page-goods").size()==0){
        $(".wrap-add-moregoods").addClass("mt20");
    }
}).on("click",".add_newprovider_btn",function(){
    addProvider($(this));
}).on("click",".close_keyb",function(){
    $(this).closest(".pop-keyboard").addClass("hide");
}).on("click",".goods_group",function(){
    PopWin.show($(".pop-goodsgroup"));
}).on("click",".group_result_list>.group-item",function(){
    var name = $(this).attr("data-name");
    var id = $(this).attr("data-id");
    $goods.find(".goods_group").text(name).attr("data-id",id);
    PopWin.hide($(".pop-goodsgroup"));
}).on("click",".check_print_stockin",function(){ //是否打印收货单
    $(this).find(".item-check").toggleClass("active");
}).on("click",".change_print",function(){
    if($(this).hasClass("forbid_click")){
        Tip("暂无可切换打印机");
        return false;
    }
    $(".pop-change").removeClass("hide");
});
//添加&编辑商品
function operateGoods($obj){
    if($obj.hasClass("forbid")){
        return false;
    }
    var goodsname_null=false;
    var provider_null=false;
    var price_null=false;
    var commission_null=false;
    var arrival_null=false;
    var cost_null=false;
    var deposit_null=false;
    if(goods_id==0){//新建
        var action="batch_add_goods";
        var goods_list=[];
        $(".page-goods").each(function(){
            var $goods=$(this);
            var goods_name=$.trim($goods.find(".goods_name").text());
            var supply_type=parseInt($goods.find(".goods_type.active").attr("data-id"));
            var group=parseInt($goods.find(".goods_group").attr("data-id"));
            var shop_supplier_id=parseInt($goods.find(".supply_name").attr("data-id"));
            var goods_unit=$goods.find(".choose_unit").attr("data-id");
            var price=$.trim($goods.find(".choose_price .num_str").text());
            var commission=$.trim($goods.find(".choose_commission .num_str").attr("data-id"));
            var deposit=$.trim($goods.find(".choose_deposit .num_str").text());
//            var arrival=$.trim($goods.find(".choose_storage .num_str").text());
            var arrival=$.trim($goods.find(".choose_stockin .num_str").text()); //到货量
            var print_stockin_receipt=0;//是否打印到货单
            var cost=$.trim($goods.find(".choose_cost .num_str").text());
            var imgurl=$goods.find(".add_img").attr("url");
            if(imgurl.indexOf("/static/kaipiao/img/add.png")>-1){
                imgurl = 'https://odhm02tly.qnssl.com/o_1bj7bjmgiu6k1nt6g6ac631t2l7.jpg';
            }else if(goods_id==0 && $goods.find(".img_progress").width()<52){
                imgurl = 'https://odhm02tly.qnssl.com/o_1bj7bjmgiu6k1nt6g6ac631t2l7.jpg';
            }
            if(!goods_name||goods_name=="选择货品"){
                goodsname_null=true;
                return false;
            }
            if(supply_type==1&&!shop_supplier_id){
                provider_null=true;
                return false;
            }
            if(!regx_money.test(price)){
                price_null=true;
                return false;
            }
            if(!regx_int.test(commission)){
                commission_null=true;
                return false;
            }
            if(!regx_int.test(deposit)){
                deposit_null=true;
                return false;
            }
            if(!regx_int.test(arrival)){
                arrival_null=true;
                return false;
            }
            if(!regx_money.test(cost)){
                cost_null=true;
                return false;
            }
            if(arrival>0 && $goods.find(".check_print_stockin .item-check").hasClass("active")){
                print_stockin_receipt = 1;
            }
            var goods={
                goods_name:goods_name,
                supply_type:supply_type,
                group:group,
                shop_supplier_id:shop_supplier_id,
                unit:goods_unit,
                price:price,
                commission:commission,
                deposit:deposit,
                arrival_number:arrival,
                cost_price:cost,
                img_url:replaceQiniu(imgurl),
                print_stockin_receipt:print_stockin_receipt
            };
            goods_list.push(goods);
        });
        var args={
            action:action,
            goods_list:goods_list
        }
    }else{//编辑
        var action="set";
        var goods_name=$.trim($(".goods_name").text());
        var supply_type=parseInt($(".goods_type.active").attr("data-id"));
        var group=parseInt($(".goods_group").attr("data-id"));
        var shop_supplier_id=parseInt($(".supply_name").attr("data-id"));
        var goods_unit=$(".choose_unit").attr("data-id");
        var price=$.trim($(".choose_price .num_str").text());
        var commission= $.trim($(".choose_commission .num_str").attr("data-id"));
        var deposit= $.trim($(".choose_deposit .num_str").text())||0;
//        var arrival=$.trim($(".choose_storage .num_str").text());
        var arrival=$.trim($(".choose_stockin .num_str").text()); //到货量
        var print_stockin_receipt=0;//是否打印到货单
        var cost=$.trim($(".choose_cost .num_str").text());
        var imgurl=$("#add_img_0").attr("url");
        if(imgurl.indexOf("/static/kaipiao/img/add.png")>-1){
            imgurl = 'https://odhm02tly.qnssl.com/o_1bj7bjmgiu6k1nt6g6ac631t2l7.jpg';
        }
        if(!goods_name||goods_name=="选择货品"){
            goodsname_null=true;
        }
        if(supply_type==1&&!shop_supplier_id){
            provider_null=true;
        }
        if(!regx_money.test(price)){
            price_null=true;
        }
        if(!regx_int.test(commission)){
            commission_null=true;
        }
        if(!regx_int.test(deposit)){
            deposit_null=true;
        }
        if(!regx_int.test(arrival)){
            arrival_null=true;
        }
        if(!regx_money.test(cost)){
            cost_null=true;
        }
        if(arrival>0 && $(".check_print_stockin .item-check").hasClass("active")){
            print_stockin_receipt = 1;
        }
        var args={
            action:action,
            goods_id:goods_id,
            goods_name:goods_name,
            supply_type:supply_type,
            group:group,
            shop_supplier_id:shop_supplier_id,
            unit:goods_unit,
            price:price,
            commission:commission,
            deposit:deposit,
            arrival_number:arrival,
            cost_price:cost,
            img_url:replaceQiniu(imgurl),
            print_stockin_receipt:print_stockin_receipt
        }
    }
    if(goodsname_null){
        return Tip("货品名称不能为空");
    }
    if(provider_null){
        return Tip("代卖货品必须选择供货商");
    }
    if(price_null){
        return Tip("货品售价最多保留两位小数");
    }
    if(commission_null){
        return Tip("行费只能设置为整数或0");
    }
    if(deposit_null){
        return Tip("押金只能设置为整数");
    }
    if(arrival_null){
        return Tip("到货量只能填整数");
//        if(goods_id){
//            return Tip("库存只能填整数");
//        }else{
//            return Tip("到货量只能填整数");
//        }
    }
    if(cost_null){
        return Tip("成本价最多保留两位小数");
    }
    var url = "/salersman/goodsmanage";
    $obj.addClass("forbid");
    $.postJson(url,args,function(res) {
        $obj.removeClass("forbid");
        if (res.success) {
            var status = "";
            if(goods_id==0){
                Tip("商品添加成功");
            }else{
                status = "&status=2";
                Tip("商品编辑成功");
            }
            setTimeout(function(){
                window.history.go(-1);
//                window.location.href="/salersman/home?tab=2"+status;
            },1200);
        }else{
            Tip(res.error_text);
        }
    },function(res){
        $obj.removeClass("forbid");
        if(res.status == 403){
            Tip(JSON.parse(res.responseText).error_text);
        }else{
            Tip(ERROR_TXT);
        }
    },function(){
        Tip(TIMEOUT_TXT);
        $obj.removeClass("forbid");
    });
}
//添加供货商
function addProvider(target){
    if(target.hasClass("forbid")){
        return false;
    }
    var username= $.trim($(".new_provider_name").val());//姓名
    var phone= $.trim($(".new_provider_phone").val());//手机
    var regPhone=/^(1)\d{10}$/;
    if(!username){
        return Tip('供货商姓名不能为空');
    }
    if(!phone){
        // return Tip('手机号不能为空');
        phone="";
    }
    if(!regPhone.test(phone)&&phone){
        return Tip("手机号必须为11位数字");
    }
    var url='/salersman/supplier';
    var args={
        action:'add',
        username:username,
        phone:phone
    }
    target.addClass("forbid");
    $.postJson(url,args,function(res){
        target.removeClass("forbid");
        if(res.success){
            Tip("添加成功");
            $(".pop-addprovider").addClass("hide").find("input").val("");
            var supplier_id=res.supplier_id;
            $provider.attr("data-id",supplier_id).text(username+' '+phone);
        }else{
            return Tip(res.error_text);
        }
    },function(){
        target.removeClass("forbid");
        Tip(ERROR_TXT);
    },function(){
        target.removeClass("forbid");
        Tip(TIMEOUT_TXT);
    });
}
//搜索供应商或货品
function searchSupply($obj){
    var type=$obj.attr("data-type");
    var key = $.trim($obj.val());
    if(key==""){
        return false;
    }
    if(type=="goods"){//搜索商品
        var args = {
            action:"search_goods_name",
            name:key
        };
        $.postJson("/salersman/goodsmanage",args,function(res){
            if(res.success){
                var datalist = res.goods_name_list;
                $(".search_result_list").empty();
                $(".no_result").addClass("hide");
                var lis = '<li class="item-goods">'+key+'</li>';
                for(var i=0; i<datalist.length; i++){
                    var name = datalist[i];
                    lis += '<li class="item-goods">'+name+'</li>';
                }
                $(".search_result_list").append(lis);
            }else{
                return Tip(res.error_text);
            }
        },function(){
            Tip(ERROR_TXT);
        },function(){
            Tip(TIMEOUT_TXT);
        });
    }else{//搜索供货商
        var args = {
            action:"search_supplier",
            name:key
        };
        $.postJson("/common/suppliersearch",args,function(res){
            if(res.success){
                var staff_list = res.data_list;
                $(".search_result_list").empty();
                $(".no_result").addClass("hide");
                if(staff_list.length==0){
                    $(".no_result").removeClass("hide");
                    $(".search_result_list").append('<li class="to_new_provider"><a href="javascript:;">未找到，新建供货商</a></li>');
                    return false;
                }
                var lis = "";
                for(var i=0; i<staff_list.length; i++){
                    var staff = staff_list[i];
                    lis += '<li data-id='+staff.id+'>'+staff.realname+' '+staff.phone+'</li>';
                }
                $(".search_result_list").append(lis);
            }else{
                return Tip(res.error_text);
            }
        },function(){
            Tip(ERROR_TXT);
        },function(){
            Tip(TIMEOUT_TXT);
        });
    }
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
function keyboardOperate($obj){
    var cur_ipt = $(".keyboard-input");
    var key_val = cur_ipt.val();
    $(".keyboard-input").val(key_val);
    if($obj.hasClass("delete_key")){
        if(key_val==""){
            return false;
        }else{
            key_val = key_val.slice(0, key_val.length-1);
            if(key_val.length==0){
                $(".finish_key").addClass("forbid");
            }
        }
    }else{//数字输入
        var temp_key_val = key_val+$obj.text();
        if($keyboard.hasClass("choose_price")||$keyboard.hasClass("choose_cost")){//售价、成本价两位小数
            if(!regx_money.test(temp_key_val)){
                //Tip("售价只能保留两位小数");
                return false;
            }else{
                if(parseFloat(temp_key_val)>9999.99){
                    return false;
                }
            }
        }else if($keyboard.hasClass("choose_stockin") || $keyboard.hasClass("choose_storage") || $keyboard.hasClass("choose_commission")|| $keyboard.hasClass("choose_deposit")){//到货量、行费、押金整数
            if(!regx_int.test(temp_key_val)){
                return false;
            }else{
                if(temp_key_val.length>5){
                    return false;
                }
            }
        }
        key_val = temp_key_val;
    }
    $(".keyboard-input").val(key_val);
}
function initUploadImg(index){
    var button='add_img_'+index;
    var container='add_img_area_'+index;
    var $img=$("#"+button);
    var $progress=$("#"+container).find(".img_progress");
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: button,
        container: container,
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
        resize: {width: 200},//压缩后上传
        init: {
            'FilesAdded': function (up, files) {
                $progress.css("width","0%").text("0%");
                plupload.each(files,function(file){
                    !function(){
                        previewImage(file,function(imgsrc){
                            $img.attr("src",imgsrc);
                        });
                    }();
                });
            },
            'UploadProgress': function (up, file) {
                $progress.css("width",file.percent+"%").text(file.percent+"%");//显示上传进度
            },
            'FileUploaded': function (up, file, info) {
                $img.attr("url",qiniu_domain+file.id+".jpg");
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
                $(".img_progress").css("width","0%");
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
}
