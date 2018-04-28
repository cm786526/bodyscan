var goods_order_count = [] , goods_sale = [] , goods_wasted = [] , goods_arrival = [];

$(document).ready(function() {
    getGoodsDetailData('day');
    getEchartsData(1,15);
}).on('click', '.set_mcalendar', function() {

}).on('click', '.query_type_ul li', function() {
    var $this = $(this);
    if($this.hasClass('active')){
        return false;
    }
    var $parent = $this.parent('.query_type_ul');
    var type = $(this).attr("data-type");
    $parent.find('li').removeClass('active');
    $this.addClass('active');
    $(".wrap-loading-box").removeClass("hide");
    getGoodsDetailData(type);
    if(type=='day'){
        getEchartsData(1,15);
    }else if(type=='week'){
        getEchartsData(2,10);
    }else{
        getEchartsData(3,6);
    }
}).on('click', '.data_indicator_ul li', function() {
    var type = $(this).attr("data-type");
    if(type=='order'){
        $(this).toggleClass('active-1');
    }else if(type=='sales'){
        $(this).toggleClass('active-2');
    }else if(type=='loss'){
        $(this).toggleClass('active-3');
    }else{
        $(this).toggleClass('active-4');
    }
}).on('click', '.day_data_list_box', function() {   // 前往查看各分店详情
    var goods_id = $('#goods_id').val();
    window.location.href = '/common/goodsdetail?action=get_subbranch_detail&goods_id='+goods_id;
});

// 得到当前的日期
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

// 初始化Echarts图
var myChart = null;
function initGoodsEcharts(data_order, data_sale, data_wasted, data_arrival){
    myChart = echarts.init(document.getElementById('chart_goods'));
    option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            orient: 'horizontal',
            x: 'center',
            y: 'bottom',
            itemGap: 30,
            inactiveColor: '#9B9B9B',
            textStyle: {
                fontSize: 16
            },
            data:['订货','销量','损耗','到货']
        },
        grid: {
            top: '10px',
            left: 'auto',
            right: 'auto',
            bottom: '60px'
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            show: false,
            type: 'category',
            boundaryGap: false,
            data: ['','','','','','','']
        },
        yAxis: {
            show: false,
            type: ''
        },
        series: [
            {
                name:'订货',
                type:'line',
                symbol: 'none',
                data: data_order
            },
            {
                name:'销量',
                type:'line',
                symbol: 'none',
                data: data_sale
            },
            {
                name:'损耗',
                type:'line',
                symbol: 'none',
                data: data_wasted
            },
            {
                name:'到货',
                type:'line',
                symbol: 'none',
                data: data_arrival
            }
        ]
    };
    myChart.setOption(option);
}


// 获取商品天统计情况
var temp_item_1 = '{{each data_list as data}}'+
                    '<ul class="day_data_list">'+
                        '<li class="date-big-length">{{data["date_text"]}}</li>'+
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
                '<ul class="day_data_list">'+
                    '<li class="date-big-length">{{data["date_text"]}}</li>'+
                    '<li>{{data["total_order_amount"]}}</li>'+
                    '<li>{{data["total_yesterday_wasted"]}}</li>'+
                    '<li>{{data["total_yesterday_sale"]}}</li>'+
                    '<li>{{data["total_today_arrival"]}}</li>'+
                    '<li>{{data["average_purchase_price"]}}</li>'+
                    '<li>{{data["average_price"]}}</li>'+
                '</ul>'+
            '{{/each}}';
var temp_item_head_1 = '<ul><li class="date-big-length">日期</li><li>订货</li><li><span class="four-num">昨日损耗</span></li><li><span class="four-num">昨日销量</span></li><li><span class="four-num">今日到货</span></li><li><span class="four-num">今日进价</span></li><li><span class="four-num">今日售价</span></li><li><span class="four-num">当前库存</span></li></ul>';
var temp_item_head_2 = '<ul><li class="date-big-length">周次</li><li><span class="four-num">累计订货</span></li><li><span class="four-num">累计损耗</span></li><li><span class="four-num">累计销量</span></li><li><span class="four-num">累计到货</span></li><li><span class="four-num">平均进价</span></li><li><span class="four-num">平均售价</span></li></ul>';
var temp_item_head_3 = '<ul><li class="date-big-length">月份</li><li><span class="four-num">累计订货</span></li><li><span class="four-num">累计损耗</span></li><li><span class="four-num">累计销量</span></li><li><span class="four-num">累计到货</span></li><li><span class="four-num">平均进价</span></li><li><span class="four-num">平均售价</span></li></ul>';
function getGoodsDetailData(type){
    var url = '/common/goodsdetail';
    $(".wrap-loading-box").removeClass("hide");
    var goods_id = $("#goods_id").val();
    var action = 'get_goods_demand_by_date';
    var render_template_item = temp_item_1;
    if(type=="week"){
       action = 'get_goods_demand_by_week';
       render_template_item = temp_item_2;
    }
    if(type=="month"){
        action = 'get_goods_demand_by_month';
        render_template_item = temp_item_2;
    }
    var args = {
        action: action,
        goods_id: goods_id
    };
    var $list = $('.day_data_list_box');
    $.postJson(url, args, function(res){
        if(res.success){
            $list.empty();
            $('.no_staff_result').remove();
            var data_list = res.data_list;
            if(!data_list){
                var str = '<p class="no_staff_result">没有数据！</p>'
                $('.day_data_list_box').append(str);
                $(".wrap-loading-box").addClass("hide");
            }else{
                var render = template.compile(render_template_item);
                var html = render(res);
                if(type == 'day'){
                    var all_data = temp_item_head_1 + html
                    $('.day_data_list_box').append(all_data);
                }else if(type=='week'){
                    var all_data = temp_item_head_2 + html
                    $('.day_data_list_box').append(all_data);
                }else{
                    var all_data = temp_item_head_3 + html
                    $('.day_data_list_box').append(all_data);
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


// 获取初始化Echarts图所用数据，按天type=1,num=10,按周type=2,num=10,按月type=3,num=6;
function getEchartsData(type,num){
    var url = '/common/goodsdetail';
    var action = 'get_goods_demand_for_recent';
    var goods_id = $("#goods_id").val();
    var args = {
        action: action,
        goods_id: goods_id,
        statistic_type: type,
        number: num
    }
    $.postJson(url, args, function(res){
        if(res.success){
            var data_list = res.data_list;
            goods_order_count.splice(0,goods_order_count.length);
            goods_sale.splice(0,goods_sale.length);
            goods_wasted.splice(0,goods_wasted.length);
            goods_arrival.splice(0,goods_arrival.length);
            for(var i=0;i<data_list.length;i++){
                goods_order_count.push(data_list[i].total_order_amount);
                goods_sale.push(data_list[i].total_yesterday_sale);
                goods_wasted.push(data_list[i].total_yesterday_wasted);
                goods_arrival.push(data_list[i].total_today_arrival);
            }
            initGoodsEcharts(goods_order_count, goods_sale, goods_wasted, goods_arrival);
        }else{
            return Tip(res.error_text);
        }
    })
}



