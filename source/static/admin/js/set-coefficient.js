var cur_select_radio_id = 0;

$(document).ready(function() {
    getReserveRatio(1);
}).on("click",".close_keyb",function(){
    $(this).closest('.pop-bwin').addClass('hide');
}).on('click', '.switch_type span', function() {
    var $this = $(this);
    var type = parseInt($(this).attr("data-type"));
    if($this.hasClass('active')){
        return false;
    }
    $('.switch_type').find('span').removeClass('active');
    $this.addClass('active');
    if(type==1){
        $('.fruit_ratio_list').removeClass('hide');
        $('.vegetable_ratio_list').addClass('hide');
        $('.discount_ratio_list').addClass('hide');
        getReserveRatio(type);  
    }else if(type==2){
        $('.fruit_ratio_list').addClass('hide');
        $('.vegetable_ratio_list').removeClass('hide');
        $('.discount_ratio_list').addClass('hide');       
        getReserveRatio(type);    
    }else{
        $('.fruit_ratio_list').addClass('hide');
        $('.vegetable_ratio_list').addClass('hide');
        $('.discount_ratio_list').removeClass('hide');   
        getDiscountRatio();
    }
}).on('click', '.fruit_ratio_list li, .vegetable_ratio_list li', function() {
    var ratio_id = parseInt($(this).attr("data-id"));
    cur_select_radio_id = ratio_id;
    var ratio_value = $(this).attr("data-ratio");
    var region_name = $(this).find('.region-name').text();
    $('.cur_region_name').text(region_name);
    $('.cur_region_name').attr("data-type", "ratio");
    $('.cur_region_name').attr("data-region", $(this).attr("data-region"));
    $('.region-weather-box').removeClass("hide");
    $('.modify-coefficient').val(ratio_value);
    var shop_city_code = $(this).attr("data-code");
    getWeatherInfo(shop_city_code);
    $("#pop_entering_keyboard").removeClass('hide');
    actionIn(".pop-keyboard-content",'fadeInUp',0.2,"ease");
}).on('click', '.discount_ratio_list li', function() {
    var ratio_id = parseInt($(this).attr("data-shopgoods"));
    cur_select_radio_id = ratio_id;
    var ratio_value = $(this).attr("data-ratio");
    var goods_name = $(this).find('.region-name').text();
    $('.cur_region_name').text(goods_name);
    $('.cur_region_name').attr("data-type", "dis_ratio");
    $('.region-weather-box').addClass("hide");
    $('.modify-coefficient').val(ratio_value);
    $("#pop_entering_keyboard").removeClass('hide');
    actionIn(".pop-keyboard-content",'fadeInUp',0.2,"ease");
})


var ratio_item = '{{each data_list as data}}'+
                '<li data-region="{{data["shop_region"]}}" data-code="{{data["shop_city"]}}" data-shopgoods="{{data["shop_goods_id"]}}" data-ratio="{{data["reserve_ratio"]}}">'+
                    '<span class="region-name clip">{{data["region_name"]}}</span>预定量系数<span class="ratio-value">{{data["reserve_ratio"]}}</span>'+
                '</li>'+
           '{{/each}}';
// 获取各个区域商品预订系数
function getReserveRatio(type){
    var url = '/admin/goodsmanage';
    var shop_id = $('.cur_shop_name').attr('data-id');
    var args = {
        action: 'get_reserve_ratio',
        classify: type
    }
    if(type==1){
        var $list = $('.fruit_ratio_list');   
    }else{
        var $list = $('.vegetable_ratio_list');
    }
    if($list.find('li').length > 0){
        return false;
    }
    $('.wrap-loading-box').removeClass('hide');
    $.postJson(url,args,function(res){
        if(res.success){
            $list.empty();
            var data_list = res.data_list;
            if(data_list.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                $list.append(str);
            }else{
                var render = template.compile(ratio_item);
                var html = render(res);
                $list.append(html);
            }
            $('.wrap-loading-box').addClass('hide');
        }else{
            $('.wrap-loading-box').addClass('hide');
            return Tip(res.error_text);
        }
    })
}

var dis_ratio_item = '{{each data_list as data}}'+
                '<li data-shopgoods="{{data["shop_goods_id"]}}" data-ratio="{{data["reserve_ratio"]}}">'+
                    '<span class="region-name">{{data["goods_name"]}}</span><span class="ratio-value">{{data["reserve_ratio"]}}</span>'+
                '</li>'+
           '{{/each}}';
// 获取促销商品预定量系数列表
function getDiscountRatio(){
    var url = '/admin/goodsmanage';
    var shop_id = $('.cur_shop_name').attr('data-id');
    var args = {
        action: 'get_reserve_ratio_discount'
    }
    var $list = $('.discount_ratio_list');   
    if($list.find('li').length > 0){
        return false;
    }
    $('.wrap-loading-box').removeClass('hide');
    $.postJson(url,args,function(res){
        if(res.success){
            $list.empty();
            var data_list = res.data_list;
            if(data_list.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                $list.append(str);
            }else{
                var render = template.compile(dis_ratio_item);
                var html = render(res);
                $list.append(html);
            }
            $('.wrap-loading-box').addClass('hide');
        }else{
            $('.wrap-loading-box').addClass('hide');
            return Tip(res.error_text);
        }
    })
}


// 设置与定量系数
function  setCoefficient(){
    var ratio_value = $('.modify-coefficient').val();
    var shop_region = $('.cur_region_name').attr("data-region");
    var classify = $('.switch_type').find('.active').attr("data-type");
    var url = '/admin/goodsmanage';
    var args = {
        action: 'set_reserve_ratio',
        shop_region: shop_region,
        reserve_ratio: ratio_value,
        classify: classify
    }
    $.postJson(url,args,function(res){
        if(res.success){
            Tip('设置成功');
            $("#pop_entering_keyboard").addClass('hide');
            setTimeout(function(){
                window.location.reload();
            },200)
        }else{
            return Tip(res.error_text);
        }
    })
}


// 设置促销商品系数
function setDiscountRatio(){
    var reserve_ratio = $('.modify-coefficient').val();
    var url = '/admin/goodsmanage';
    var args = {
        action: 'set_reserve_ratio_discount',
        shop_goods_id: cur_select_radio_id,
        reserve_ratio: reserve_ratio
    }
    $.postJson(url,args,function(res){
        if(res.success){
            Tip('设置成功');
            $("#pop_entering_keyboard").addClass('hide');
            setTimeout(function(){
                // window.location.reload();
            },200)
        }else{
            return Tip(res.error_text);
        }
    }) 
}

// 设置处获取天气列表
function getWeatherInfo(code){
    var url = '/recorder/settings';
    var args = {
        action: 'get_weather',
        city_code: code
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data = res.data_list;
            var str1 =  data[2].weather+"，"+data[2].weekday+"，"+data[2].weather+"，"+data[2].low_temperature+"~"+data[2].high_temperature+"℃"+"，"+data[2].holiday;
            var str2 =  data[3].weather+"，"+data[3].weekday+"，"+data[3].weather+"，"+data[3].low_temperature+"~"+data[3].high_temperature+"℃"+"，"+data[3].holiday;
            
            $('.tomorrow').text(str1);
            $('.after_tomorrow').text(str2);
        }else{
            return Tip(res.error_text);
        }
    })
}
