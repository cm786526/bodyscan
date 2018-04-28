var cur_action = $.getUrlParam('action');
var cur_edit_goods_id = 0;
$(document).ready(function() {
    if(cur_action == 'edit_goods'){
        $('.add_edit_title').text('修改商品');
        $('.finish_add_or_edit_operate').text('完成修改');
        $('.finish_add_or_edit_operate').attr("data-action",'edit_goods');
        $('.delete_goods').removeClass('hide');
        cur_edit_goods_id = parseInt($.getUrlParam('goods_id'));
    }
}).on('click', '.switch_type span', function() {  //切换商品类型
    var $this = $(this);
    var type = parseInt($(this).attr("data-type"));
    if($this.hasClass('active')){
        return false;
    }else{
        $this.siblings('span').removeClass('active');
        $this.addClass('active');
    }
}).on('click', '.delete_goods', function() {
    $('.pop_delete_box').removeClass('hide');
}).on('click', '.delete_goods_sure', function() {
    var $this = $(this);
    var action = $(this).attr('data-action');
    addGoods($this, action);
}).on('click', '.finish_add_or_edit_operate', function() {
    var $this = $(this);
    var action = $(this).attr('data-action');
    addGoods($this, action);
}).on('click', '.cancle_cur_operate', function() {
    window.history.back();
}).on('click', '.select-shop', function() {
    $('.add_pop_shop_list').removeClass('hide');
}).on('click', '.pop_shop_list', function(e) {
    if($(e.target).closest('.pop-shop-list-content').length==0){
        $(this).closest('.pop-shop-list').addClass('hide');
    }
}).on('click', '.pop_cancle', function() {
    $(this).closest('.pop-shop-list').addClass('hide');
}).on('click', '.select_all_btn', function() {
    if($(this).hasClass('active')){
        $(this).removeClass('active');
        $('.multiple_choice').find('.select-all-btn').removeClass('active');
    }else{
        $(this).addClass('active');
        $('.multiple_choice').find('.select-all-btn').addClass('active');
    }
}).on('click', '.multiple_choice li', function() {
    $('.multiple_choice').find('.select_all_btn').removeClass('active');
    $(this).find('.select-all-btn').toggleClass('active');
}).on('click', '.multiple_choice_complete', function() {
    $(this).closest('.pop-shop-list').addClass('hide');
});

// 删除商品
function deleteGoods($obj){
    if($obj.hasClass('forbit')){
        return false;
    }
    var url = '';
    var args = {
        action: ''
    }
    $obj.addClass('forbit');
    $.postJson(url, args, function(res){
        $obj.removeClass('forbit');
        if(res.success){

        }else{
            return Tip(res.error_text);
        }
    })
}

// 添加、编辑商品
function addGoods($obj, action){
    if($obj.hasClass('forbit')){
        return false;
    }
    var cur_action = '';
    var url = '/admin/goodsmanage';
    var classify = parseInt($('.switch_classify_type').find('.active').attr("data-type"));
    var unit = parseInt($('.switch_unit_type').find('.active').attr("data-type"));
    var goods_code = parseInt($('#product_id').val());
    if(!goods_code){
        return Tip('请输入商品编码');
    }
    var goods_name = $.trim($('#add_goods_name').val());
    if(!goods_name){
        return Tip('请输入商品名称');
    }
    var shop_list = [];
    $('.multiple_choice li').each(function(){
        var id = parseInt($(this).attr("data-id"));
        if($(this).find('.select-all-btn').hasClass('active')){
            shop_list.push(id);
        }
    })
    var args = {
        classify: classify,
        goods_name: goods_name,
        goods_code: goods_code,
        unit: unit,
        shop_list: shop_list
    }
    if(action == 'edit_goods' || action == 'delete_goods'){
        args.goods_id = cur_edit_goods_id;
        cur_action = 'edit_goods';
    }else{
        cur_action = 'add_goods';
    }
    if(action == 'delete_goods'){
        args.status = -1;
    }
    args.action = cur_action;
    $obj.addClass('forbit');
    $.postJson(url, args, function(res){
        $obj.removeClass('forbit');
        if(res.success){
            if(action == 'edit_goods' || action == 'delete_goods'){
                $('.pop_delete_box').addClass('hide');
                Tip("编辑成功");
            }else{
                Tip("添加成功")
            }
            setTimeout(function(){
                window.location.href = '/admin/shopmanage?tab=1';
            },1000)
        }else{
            return Tip(res.error_text);
        }
    })
}