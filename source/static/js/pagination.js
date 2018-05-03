var _page=0;
var page_sum=0;
$(document).ready(function(){
    getPageResult(_page);
}).on('click','.pre-page',function(){
    if(_page==0){
        return Tip('没有上一页啦！');
    }else{
        _page--;
        getPageResult(_page);
        $('.page-now').text(_page+1);
    }
}).on('click','.next-page',function(){
    if(_page==(page_sum-1)){
        return Tip('没有下一页啦！');
    }else{
        _page++;
        getPageResult(_page);
        $('.page-now').text(_page+1);
    }
}).on('click','.more-page>li',function(){
    var page=$.trim($('.input-page').val());
    var page=Number($(this).text());
    if(page==$(".page-now").text()){
        return Tip('当前就在该页哦~');
    }else{
        _page=page-1;
        getPageResult(_page);
        $('.page-now').text(page);
    }
    $(".more-page").addClass("hide");
    ifMorePage();
}).on('click','.jump-to',function(){
    jump_page=$(".input-page").val()
    if(jump_page>page_sum||jump_page<1||isNaN(jump_page)){
        Tip("页码不正确");
        return;
    }
    _page=jump_page;
    getPageResult(_page-1);
    $('.page-now').text(_page);
});