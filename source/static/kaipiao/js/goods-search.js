$(document).ready(function() {

}).on("click",".go_search_goods",function(){
    $(".search_goods_list_box").empty();
    $(".search_msg").text("");
    $(".search-txt-info").addClass("hide");
    $(".pop-search").removeClass("hide");
    $(".page_search_ipt").val("").attr("placeholder","输入商品名/首字母搜索").focus();
}).on("click",".close_search",function(){
    $(".pop-search").addClass("hide");
}).on("click",".search_clear",function(){
    $(".search_goods_list_box").empty();
    $(".search_msg").text("");
    $(".search-txt-info").addClass("hide");
    $(".page_search_ipt").val("").focus();
}).on("input propertychange",".page_search_ipt",function(){
    var code = $.trim($(this).val());
    searchGoodsResult(code);
});
//商品所有汉字转拼音
function toPinyin(){
    $("body").append('<input type="text" class="hide pingying_box">');
    var $pinyin = $("input.pingying_box");
    for(var i=0; i<all_goods_list.length; i++){
        var sgoods = all_goods_list[i];
        var goods_name = sgoods.goods_name;
        var py_name = $pinyin.val(goods_name).toPinyin().toLowerCase().replace(/\s/g,"");
        var first_name_key = "";
        if(goods_name.length>0){
            for(var n=0; n<goods_name.length; n++){
                if(goods_name[n]!=" "){
                    var f_name_key = $pinyin.val(goods_name[n]).toPinyin().toLowerCase();
                    if(f_name_key){
                        first_name_key += f_name_key[0];
                    }
                }
            }
        }
        sgoods.all_name_key = py_name;
        sgoods.first_name_key = first_name_key;
    }
    $pinyin.remove();
}
//搜索结果
function searchGoodsResult(code){
    if(code==""){
        $(".search-txt-info").addClass("hide");
        $(".search_goods_list_box").empty();
        return false;
    }
    var resultArr = [], regx_num = /^\d+$/;
    var regx_str = code.toLowerCase();
    for(var i=0; i<all_goods_list.length; i++){
        var goods = all_goods_list[i];
        var all_name_key = goods.all_name_key,
            first_name_key = goods.first_name_key,
            goods_name = goods.goods_name;
        if(all_name_key.indexOf(regx_str)>=0 || first_name_key.indexOf(regx_str)>=0 || goods_name.indexOf(regx_str)>=0){
            resultArr.push(goods);
        }
    }
    $(".no_result").addClass("hide");
    if(resultArr.length>0){
        var lis = "";
        var render = template.compile(goods_item);
        var res = {"all_goods":resultArr};
        var html = render(res);
        $(".search_goods_list_box").empty().append(html);
        $(".search_msg").text(code);
        $(".search-txt-info").removeClass("hide");
    }else{
        $(".no_result").removeClass("hide");
        $(".search_goods_list_box").empty();
        $(".search_msg").text("");
        $(".search-txt-info").addClass("hide");
    }
}
