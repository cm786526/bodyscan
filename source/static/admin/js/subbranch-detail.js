var cur_date = getCurDate();
var cur_goods_id = $.getUrlParam('goods_id');
$(document).ready(function($) {
    getCurDate();
    getShopData(cur_date,'day');
    getShopData(cur_date,'week');
    initWeekShow();
}).on('click', '.set_mcalendar', function() {
    $(".wrap-loading-box").removeClass("hide");
    var type = '';
    var date = '';
    if($(this).hasClass('week')){
        type = 'week';
        date = $('.date_by_week').attr('data-val');
    }else{
        type = 'day';
        date = $('.date_by_day').val();
    }
    getShopData(date, type);
});

// 将按周查询的时间显示重新初始化
function initWeekShow(){
    var end_time = getDateAfter_n(cur_date, 7, '.')
    var start_time = cur_date.toString().split("-");
        start_time = start_time[1]+'.'+start_time[2];
    var last_show_time = start_time+' - '+end_time;
    $('.date_by_week').val(last_show_time)
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

// 按天、周获取各店铺对应的商品数据数据

var temp_item_1 = '{{each data_list as data}}'+
                    '<ul class="day_data_list">'+
                        '<li class="date-big-length clip">{{data["shop_text"]}}</li>'+
                        '<li>{{data["total_order_amount"]}}</li>'+
                        '<li>{{data["total_yesterday_wasted"]}}</li>'+
                        '<li>{{data["total_yesterday_sale"]}}</li>'+
                        '<li>{{data["total_today_arrival"]}}</li>'+
                        '<li>{{data["average_purchase_price"]}}</li>'+
                        '<li>{{data["average_price"]}}</li>'+
                        '<li>{{data["total_current_stock"]}}</li>'+
                    '</ul>'+
                '{{/each}}';
var temp_item_2 = '{{each data_list as data}}'+
                    '<ul class="total_data_list">'+
                        '<li class="date-big-length clip">{{data["shop_text"]}}</li>'+
                        '<li>{{data["total_order_amount"]}}</li>'+
                        '<li>{{data["total_yesterday_wasted"]}}</li>'+
                        '<li>{{data["total_yesterday_sale"]}}</li>'+
                        '<li>{{data["total_today_arrival"]}}</li>'+
                        '<li>{{data["average_purchase_price"]}}</li>'+
                        '<li>{{data["average_price"]}}</li>'+
                    '</ul>'+
                '{{/each}}';

function getShopData(date, type){
    var url = '/common/goodsdetail';
    var action = 'get_goods_demand_by_shop';
    var statistic_type = 1;
    if(type== 'week'){
        statistic_type=2;
    }
    var args = {
        action: action,
        goods_id: cur_goods_id,
        date: date,
        statistic_type: statistic_type
    }
    $.postJson(url, args, function(res){
        if(res.success){
            if(type=='day'){
                $('.day_data_list_box').find('.day_data_list').remove();
                $('.day_data_list_box').find('.no_result').remove();
            }else{
                $('.total_data_list_box').find('.total_data_list').remove();
                $('.total_data_list_box').find('.no_result').remove();
            }
            var data_list = res.data_list;
            if(data_list.length==0){
                var str = '<p class="no_result">没有数据！</p>'
                if(type=='day'){
                    $('.day_data_list_box').append(str);
                }else{
                    $('.total_data_list_box').append(str);
                }
                $(".wrap-loading-box").addClass("hide");
            }else{
                var temp = (type=='day')?temp_item_1:temp_item_2;
                var render = template.compile(temp);
                var html = render(res);
                if(type == 'day'){
                    $('.day_data_list_box').append(html);
                }else{
                    $('.total_data_list_box').append(html);
                }
                $(".wrap-loading-box").addClass("hide");
            }
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


/**
 * 计算n天后的日期
 * initDate：开始日期，默认为当天日期， 格式：yyyymmdd/yyyy-mm-dd
 * days:天数
 * flag：返回值， 年与日之间的分隔符， 默认为xxxx年xx月xx日格式
 * 调用函数示例，getDateAfter_n('20180315',7,'-');
 * 此算法是为解决给定出事日期计算一周后的时间。
 */
function getDateAfter_n(initDate, days, flag){
    if(!days){
        return initDate;
    }
    initDate = initDate.replace(/-/g,'');
    flag = $.trim(flag);
    var date;
    // 是否设置了起始日期
    if(!$.trim(initDate)){ // 没有设置初始化日期，就默认为当前日期
        date = new Date();
    }else{
        var year = initDate.substring(0,4);
        var month = initDate.substring(4,6);
        var day = initDate.substring(6,8);
        date = new Date(year, month-1, day); // 月份是从0开始的
    }
    date.setDate(date.getDate() + days);

    var yearStr = date.getFullYear();
    var monthStr = ("0"+(date.getMonth()+1)).slice(-2, 8); // 拼接2位数月份
    var dayStr = ("0"+date.getDate()).slice(-2, 8); // 拼接2位数日期
    var result = "";
    if(!flag){
        result = yearStr+"年"+monthStr+"月"+dayStr+"日";
    }else{
        // result = yearStr+flag+monthStr+flag+dayStr+flag;
        result = monthStr+flag+dayStr;
    }
    return result;
}