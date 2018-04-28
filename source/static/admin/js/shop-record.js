
var myscroll_1 = null;
var cur_date = '';
$(document).ready(function() {
    var wrapper_height = $(window).height()-90;
    $('#wrapper').css("height",wrapper_height+"px");
    getCurDate();        // 获取当前时间
    cur_date = getCurDate();
    getRecorderRecord(cur_date);
    getWeatherByDay(cur_date);
    initIscroll();
}).on('click', '.set_mcalendar', function() {
    var cur_select_date = $('.choose_date').val();
    if(CompareDate(cur_select_date,cur_date)){
        return Tip('请选择'+cur_date+'之前的日期');
    }
    setTimeout(function(){
        getRecorderRecord(cur_select_date);
        getWeatherByDay(cur_select_date);
    },500)
}).on('click', '.cur_day_record_list_item', function() {
    var id = $(this).attr("data-id");
    window.location.href = '/common/goodsdetail?action=get_details&goods_id='+id;
});


// 初始化iscroll
function initIscroll(){
    myscroll_1 = new iScroll("wrapper",{
        hScroll: true,
        vScroll: true,
        hScrollbar: false,
        vScrollbar: false
    })
}

//得到当前的日期
function getCurDate(date){
    var isToday=false;
    if(!date){
        date = new Date();
        isToday=true;
    }
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = month<10?("0"+month):month;
    var day = date.getDate();
    day = day<10?("0"+day):day;
    var cur_time = year+"-"+month+"-"+day;
    if(isToday){
        today_str=cur_time;
    }
    $(".choose_date").val(cur_time);
    return cur_time;
}

// 获取录入记录
var record_item = '{{each data_list as data}}'+
                    '<ul class="cur_day_record_list_item" data-id="{{data["goods_id"]}}">'+
                        '<li class="li-item-1 clip">{{data["goods_name"]}}</li>'+
                        '<li>{{data["unit"]}}</li>'+
                        '<li>{{data["order_amount"]}}</li>'+
                        '<li>{{data["yesterday_wasted"]}}</li>'+
                        '<li>{{data["yesterday_sale"]}}</li>'+
                        '<li>{{data["today_arrival"]}}</li>'+
                        '<li>{{data["today_purchase_price"]}}</li>'+
                        '<li>{{data["today_price"]}}</li>'+
                        '<li>{{data["current_stock"]}}</li>'+
                        '<li class="li-item-2">{{data["create_date"]}}</li>'+
                        '<li class="li-item-3 clip">{{data["opretor_name"]}}</li>'+
                    '</ul>'+
                  '{{/each}}';
function getRecorderRecord(date){
    var url = '/admin/shopmanage';
    var shop_id = parseInt($("#cur_shop_id").val());
    var args = {
        action: 'get_shop_demand',
        shop_id: shop_id,
        date: date
    }
    $list = $('.cur_day_record_list_item');
    $('.wrap-loading-box').removeClass('hide')
    $.postJson(url, args, function(res){
        if(res.success){
            $list.remove();
            $('.no_staff_result').remove();
            var data_list = res.data_list;
            if(data_list.length==0){
                var str = '<p class="no_staff_result">没有数据！</p>'
                $('.record-list-box').append(str);
            }else{
                var render = template.compile(record_item);
                var html = render(res);
                $('.cur_day_record_list').append(html);

            }
            setTimeout(function(){
                myscroll_1.refresh()
            },500)
            $(".wrap-loading-box").addClass("hide");
        }else{
            $(".wrap-loading-box").addClass("hide");
            return Tip(res.error_text);
        }
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    })
}

// 按天获取天气信息
function getWeatherByDay(date){
    var url = '/admin/shopmanage';
    var args = {
        action: 'get_weather_by_date',
        date: date
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data = res.weather_dict;
            var str = data.weekday+'，'+data.weather+'，'+data.low_temperature+'~'+data.high_temperature+'℃';
            $('.record_weather_span').text(str);
            // $('.record_holiday_span').text(data.holiday);
        }else{
            return Tip(res.error_text);
        }
    })
}