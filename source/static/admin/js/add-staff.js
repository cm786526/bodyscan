
var cur_action = $.getUrlParam('action');
var cur_staff_id = $.getUrlParam('id');
$(document).ready(function() {
    if(cur_action == 'edit_staff'){
        $('.add_edit_title').text('编辑员工');
        $('.finish_add_or_efit_operate').text('完成编辑');
    }
}).on('click', '.switch_span', function() {
    if($(this).hasClass('switch-span-active')){
        $(this).find('.switch-txt').text('已关闭');
        if($(this).hasClass('admin_manage_switch_span')){
            $('.select_btn').find('span').removeClass('selected');
        }
    }else{
        $(this).find('.switch-txt').text('已开启')
    }
    $(this).toggleClass('switch-span-active');
}).on('click', '.add_staff_sure', function() {
    var $this = $this;

}).on('click', '.select_btn span', function() {
    var $this = $(this);
    if($('.admin_manage_is_active').find('.switch_span').hasClass('switch-span-active')){
        $this.toggleClass('selected');
    }else{
        Tip('请先点击开启管理员');
    }
}).on('click', '.add-staff-cancle', function() {
    window.location.href='/admin/shopmanage?tab=2';
}).on('click', '.admin_manage', function() {
    // $('.select_all_btn').removeClass('active');
    if($('.admin_manage_is_active').find('.switch_span').hasClass('switch-span-active')){
        $('.add_pop_shop_list').removeClass('hide');
    }else{
        Tip('请先点击开启管理员');
    }

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
}).on('click', '.recorder_pop', function() {
    if($('.recorder_pop_is_active').find('.switch_span').hasClass('switch-span-active')){
        $('.edit_pop_shop_list').removeClass('hide');
    }else{
        Tip('请先点击开启管理员');
    }
}).on('click', '.single_choice li', function() {
    $('.single_choice').find('.select-all-btn').removeClass('active');
    $(this).find('.select-all-btn').addClass('active');
}).on('click', '.single_choice_complete', function() {
    if(!$('.single_choice').find('.select-all-btn').hasClass('active')){
        return Tip('请选择店铺');
    }
    $('.single_choice li').each(function(){
        var shop_name = $(this).find('.single_choice_shop_name').text();
        if($(this).find('.select-all-btn').hasClass('active')){
            $('.recorder_pop').text(shop_name);
        }
    })
    $(this).closest('.pop-shop-list').addClass('hide');
}).on('click', '.multiple_choice_complete', function() {
    if(!$('.multiple_choice').find('.select-all-btn').hasClass('active')){
        return Tip('请至少选择一个店铺');
    }
    var str = '';
    $('.multiple_choice li').each(function(){
        var shop_name = $(this).find('.multiple_choice_shop_name').text();
        if($(this).find('.select-all-btn').hasClass('active')){
            str = str+' '+shop_name;
        }
    })
    if(str){
        $('.admin_manage').text(str);
    }
    $(this).closest('.pop-shop-list').addClass('hide');
}).on('click', '.finish_add_or_efit_operate', function() {
    addOrEditStaff($(this));
});


// 添加、编辑管理员
function addOrEditStaff($obj){
    if($obj.hasClass('forbit')){
        return false;
    }
    var url = '/admin/staffmanage';
    var admin_shop_id_list = [];
    var recorder_shop_id = 0;
    var active_admin = 0;
    var active_recorder = 0;
    var admin_permission = [];
    var remarks = $("#remark_input").val();
    if(!remarks){
        remarks = ''
    }
    if(cur_action == 'add_staff'){
        if(!$('.admin_manage_is_active').find('.switch_span').hasClass('switch-span-active') && !$('.recorder_pop_is_active').find('.switch_span').hasClass('switch-span-active')){
            return Tip("请至少开启一种员工身份");
        }
    }   
    if($('.admin_manage_is_active').find('.switch_span').hasClass('switch-span-active')){
        if(!$('.multiple_choice').find('.select-all-btn').hasClass('active')){
            return Tip('请选择管理员对应的店铺');
        }
        active_admin = 1;
    }
    if($('.recorder_pop_is_active').find('.switch_span').hasClass('switch-span-active')){
        if(!$('.single_choice').find('.select-all-btn').hasClass('active')){
            return Tip('请选择录入员对应的店铺');
        }
        active_recorder = 1;
    }

    $('.select_btn span').each(function(){
        var data_type = parseInt($(this).attr("data-type"));
        if($(this).hasClass('selected')){
            admin_permission.push(data_type);
        }
    })
    if($('.admin_manage_is_active').find('.switch_span').hasClass('switch-span-active')){
        $('.multiple_choice li').each(function(){
            var id = parseInt($(this).attr("data-id"));
            if($(this).find('.select-all-btn').hasClass('active')){
                admin_shop_id_list.push(id);
            }
        })
    }
    if($('.recorder_pop_is_active').find('.switch_span').hasClass('switch-span-active')){
        $('.single_choice li').each(function(){
            var id = parseInt($(this).attr("data-id"));
            if($(this).find('.select-all-btn').hasClass('active')){``
                recorder_shop_id = id;
            }
        })
    }

    var action = 'add_staff';
    if(cur_action == 'edit_staff'){
        action = 'edit_staff';
    }
    var args = {
        action: action,
        staff_id: cur_staff_id,
        active_admin: active_admin,
        admin_shop_id_list: admin_shop_id_list,
        active_recorder: active_recorder,
        recorder_shop_id: recorder_shop_id,
        admin_permission: admin_permission,
        remarks: remarks
    }
    $obj.addClass('forbit');
    $.postJson(url, args, function(res){
        $obj.removeClass('forbit');
        if(res.success){
            window.location.href = '/admin/shopmanage?tab=2';
        }else{
            return Tip(res.error_text);
        }
    })
}

