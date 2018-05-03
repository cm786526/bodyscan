var _page=0;
var page_sum=0;
var type=0;
var status=0;
$(document).ready(function(){
    getResultPageAdmin(0,0)
}).on('click','.pre-page',function(){
    if(_page==0){
        return Tip('没有上一页啦！');
    }else{
        _page--;
        if(type){
            getResultPageOperator(status,_page);
        }else{
            getResultPageAdmin(status,_page);
        }
        $('.page-now').text(_page+1);
    }
}).on('click','.next-page',function(){
    if(_page==(page_sum-1)){
        return Tip('没有下一页啦！');
    }else{
        _page++;
        if(type){
            getResultPageOperator(status,_page);
        }else{
            getResultPageAdmin(status,_page);
        }
        $('.page-now').text(_page+1);
    }
}).on('click','.more-page>li',function(){
    var page=$.trim($('.input-page').val());
    var page=Number($(this).text());
    if(page==$(".page-now").text()){
        return Tip('当前就在该页哦~');
    }else{
        _page=page-1;
        if(type){
            getResultPageOperator(status,_page);
        }else{
            getResultPageAdmin(status,_page);
        }
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
    if(type){
            getResultPageOperator(status,_page-1);
        }else{
            getResultPageAdmin(status,_page-1);
        }
    $('.page-now').text(_page);
}).on('click','.nav-tabs-admin',function(){
    $(".nav-tabs-li").removeClass('active');
    $(this).addClass('active');
    status=$(this).val();
    getResultPageAdmin(status,0)
}).on('click','.nav-tabs-operator',function() {
    $(".nav-tabs-li").removeClass('active');
    $(this).addClass('active');
    status = $(this).val();
    getResultPageOperator(status, 0);
});

function distribute(obj){
    var thisObj = $(obj);
    var analyze_id = thisObj.attr("analyze_id");
    $.ajax({
        type: 'post',
        url: '/operator',
        data: {
            action:"add_handler",
            analyze_id:analyze_id
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                getResultPageAdmin(0,0)
            }
        }
    })
}

function getResultPageAdmin(status,page){
    $.ajax({
        type: 'post',
        url: '/admin',
        data: {
            action:"get_analyze_list",
            page:page,
            status:status
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                $('.data_list').empty();
                var record_item = '{{each data_list as data}}'+
                    '<tr>' +
                    '<td>{{data["id"]}}</td>' +
                    '<td>{{data["admin_affiliation"]}}</td>' +
                    '<td>{{data["describe"]}}</td>' +
                    '<td>未分配</td>'+
                    '<td>'+
                    '<a onclick = "distribute(this)" analyze_id = {{data["id"]}}>领取</a>'+
                    '</td>'+
                    '</tr>' +
                    '{{/each}}';

                var render = template.compile(record_item);
                var html = render(result);
                $('.data_list').append(html);
                page_sum=result.page_sum;
                $('.page_sum').text(page_sum);
            }
        }
    })
}


//提示框
function Tip(text){
    var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
    $("body").append(tip);
    zb_timer = setTimeout(function(){
        $("#zb-tip").remove();
    },2000);
}

function getResultPageOperator(status,page){
    $.ajax({
        type: 'post',
        url: '/operator',
        data: {
            action:"get_handler_list",
            page:page,
            status:status
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                $('.data_list').empty();
                var record_item = '{{each data_list as data}}'+
                    '<tr>' +
                    '<td>{{data["id"]}}</td>' +
                    '<td>{{data["admin_affiliation"]}}</td>' +
                    '<td>{{data["describe"]}}</td>' +
                    '<td>'+
                    '{{if data["status"] == 0}}未分配{{/if}}'+
                    '{{if data["status"] == 1 || data["status"] == 2}}处理中{{/if}}'+
                    '{{if data["status"] == 3}}已处理{{/if}}'+
                    '</td>'+
                    '<td>'+
                    '{{if data["status"] == 0}}<a>分配</a>{{/if}}'+
                    '{{if data["status"] == 1 || data["status"] == 2}}<a href="/filedownload?filename={{data["file_name"]}}" target="_blank">下载数据</a>&nbsp&nbsp<a>联系上传人员</a>&nbsp&nbsp<a>上传反馈材料</a>{{/if}}'+
                    '{{if data["status"] == 3}}<a>查看</a>{{/if}}'+
                    '</td>'+
                    '</tr>' +
                    '{{/each}}';
                var render = template.compile(record_item);
                var html = render(result);
                $('.data_list').append(html);
                page_sum=result.page_sum;
                $('.page_sum').text(page_sum);
            }
        }
    })
}
