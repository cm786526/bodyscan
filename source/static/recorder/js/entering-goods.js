
$(document).ready(function(){

}).on('click', '.entering-item', function() {  //录入页js开始处
    var $this = $(this);
    if($this.hasClass('entering-item-active')){
        return false;
    }
    $('.entering-item').removeClass('entering-item-active');
    $this.addClass('entering-item-active');
}).on('click', '.next_entering_item', function() {
    var cur_active = $('.entering-item-active');
    var index = $('.entering_item').index(cur_active);
    $('.entering-item').removeClass('entering-item-active');
    var next_index = index+1;
    autoWriteIn();
    if(index==5){
        next_index = 0;
    }
    $('.entering_item').eq(next_index).addClass('entering-item-active');
}).on('click', '.entering_item', function() {
    autoWriteIn();
}).on('click', '.keyboard_sure', function() {
    typeInGoodsInfo();
});


// 监听录入项的前三项，完成预定量的自动添加
function autoWriteIn(){
    var item_1 = parseFloat($('.yesterday_wasted').val());
    var item_2 = parseFloat($('.yesterday_sale').val());
    var item_3 = parseFloat($('.current_stock').val());
    var cur_coefficient = parseFloat($('#cur_order_ratio').val());
    var tomorrow_reserve_val = 0;
    if(item_1 && item_2 && item_3){
        tomorrow_reserve_val = parseFloat((item_1 + item_2)*cur_coefficient - item_3);
        tomorrow_reserve_val = tomorrow_reserve_val.toFixed(2);
        if(tomorrow_reserve_val <= 0) {
            tomorrow_reserve_val = 0;
        }
        $("#order_amount").val(tomorrow_reserve_val);
    }
}

// 录入商品信息
function typeInGoodsInfo(){
    var url = '/recorder/enteringgoods';

    var goods_id = $("#recorder_id").val();
    var shop_id = window.localStorage.getItem("cur_shop_id");
    var yesterday_wasted = $(".yesterday_wasted").val();
    if(!yesterday_wasted){
        return Tip('请输入昨日损耗');
    }
    var yesterday_sale = $(".yesterday_sale").val();
    if(!yesterday_sale){
        return Tip('请输入昨日销量');
    }
    var current_stock = $(".current_stock").val();
    if(!current_stock){
        return Tip("请输入当前库存");
    }
    var order_amount = $("#order_amount").val();
    if(!order_amount){
        return Tip('请输入预定量')
    }
    var today_arrival = $(".today_arrival").val();
    if(!today_arrival){
        return Tip('请输入今日到货量');
    }
    var today_purchase_price = $(".today_purchase_price").val();
    if(!today_purchase_price){
        return Tip('请输入今日售价');
    }
    var today_price = $(".today_price").val();
    if(!today_price){
        return Tip('请输入今日进价');
    }
    var args = {
        action: 'stock_in',
        goods_id: goods_id,
        shop_id: shop_id,
        order_amount: order_amount,
        yesterday_wasted: yesterday_wasted,
        yesterday_sale: yesterday_sale,
        current_stock: current_stock,
        today_arrival: today_arrival,
        today_purchase_price: today_purchase_price,
        today_price: today_price
    }
    $.postJson(url, args, function(res){
        if(res.success){
            window.location.href='/recorder/goodsmanage';
        }else{
            return Tip(res.error_text);
        }
    })
}

