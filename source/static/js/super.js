var _page=0;
var page_sum=0;
var status=0;
var uncheckUrl = '../../static/images/unchecked.png';
var checkUrl = '../../static/images/checked.png';
var filename = new Array();
$(document).ready(function() {
    getResultPage(-1, 0);
}).on('click','.next-page',function() {
    if (_page == (page_sum - 1)) {
        return Tip('没有下一页啦！');
    } else {
        _page++;
        getResultPage(status, _page);
        $('.page-now').text(_page + 1);
    }
}).on('click','.table-radio',function(){
    $(".table-radio").removeClass('radio-active');
    $(this).addClass('radio-active')
}).on('click','.more-page>li',function(){
    var page=$.trim($('.input-page').val());
    var page=Number($(this).text());
    if(page==$(".page-now").text()){
        return Tip('当前就在该页哦~');
    }else{
        _page=page-1;
        getResultPage(status,_page);
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
    getResultPage(status,_page-1);
    $('.page-now').text(_page);
}).on('click','.subnav-li',function(){
    //切换状态
    $('.subnav-li').removeClass('active');
    $("#select-all").attr("src",uncheckUrl);
    $(this).addClass('active');
    status = $(this).val();
    getResultPage(status, 0);
}).on('click','.check-img',function(){
    var imgDom = $(this);
    if(imgDom.attr("src")==checkUrl){
        $("#select-all").attr("src",uncheckUrl);
        imgDom.attr("src",uncheckUrl);
    }else{
        imgDom.attr("src",checkUrl);

        //上面部分是变换图片自身，下面部分是检测是否要变换全选图片。
        //通过比较图片总数量与选中图片数量来决定。
        var imgLength = $('.check-img').length;
        var checkLength = 0;
        for (var i = 0; i <= imgLength; i++) {
            if($('.check-img').eq(i).attr("src") == checkUrl){
                checkLength ++;
            }
        }
        if(imgLength == checkLength){
            $("#select-all").attr("src",checkUrl);
        }
    }
}).on('click','#select-all',function(){
    if($(this).attr("src")== checkUrl){
        $(this).attr("src",uncheckUrl);
        $(".check-img").attr("src",uncheckUrl);
    }else{
        $(this).attr("src",checkUrl);
        $(".check-img").attr("src",checkUrl);
    }
}).on('click','#download-btn',function(){
    //批量下载
    var imgLength = $('.check-img').length;
    file_url = [];
    for (var i = 0; i <= imgLength; i++) {
        if($('.check-img').eq(i).attr("src") == checkUrl){
            file_name=$('.check-img').eq(i).attr("file_name");
            if(file_name.replace("/filedownload?action=get_feedback_pdf&filename=","")==""){
                Tip('第'+(i+1)+'项文件为空，下载失败');
                continue;
            }
            file_url.push(file_name)
        }
    }
    if(file_url.length==0){
        Tip('请选择下载内容');
        return false;
    }
    for(var index = 0; index < file_url.length; index++){
        href=file_url[index]
        name=href.replace("/filedownload?action=get_feedback_pdf&filename=","")
        download(name,href);
    }
}).on('click','#delete-btn',function(){
    var imgLength = $('.check-img').length;
    filename = [];
    for (var i = 0; i <= imgLength; i++) {
        if($('.check-img').eq(i).attr("src") == checkUrl){
            filename.push($('.check-img').eq(i).attr("file_name"))
        }
    }
    if(filename.length==0){
        Tip('请选择删除内容');
        return false;
    }
    $('#confirmModal').modal('show');
    //批量删除

}).on('click','#confirmModalButton',function(){
    var imgLength = $('.check-img').length;
    filename = [];
    for (var i = 0; i <= imgLength; i++) {
        if($('.check-img').eq(i).attr("src") == checkUrl){
            filename.push($('.check-img').eq(i).attr("file_name").replace(""))
        }
    }
    if(filename.length==0){
        Tip('请选择删除内容');
        return false;
    }
    $.ajax({
        type: 'post',
        url: '/super',
        data: {
            action: 'delete_files',
            file_name:filename
        },
        dataType:'json',
        success:function (res) {
            if(res.success){
                Tip('已删除所选文件');
                getResultPage(status,page);
            }else{
                Tip(res.error_text);
            }
        }
    });
});

//提示框
function Tip(text){
    var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
    $("body").append(tip);
    zb_timer = setTimeout(function(){
        $("#zb-tip").remove();
    },2000);
}

function getResultPage(status,page){
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
                    '<th><img class="check-img" src="../../static/images/unchecked.png" file_name={{data["file_name"]}}></th>' +
                    '<th>{{data["id"]}}</th>' +
                    '<th>{{data["admin_affiliation"]}}</th>' +
                    '<th>'+
                    '{{if data["status"] == 0}}未领取{{/if}}'+
                    '{{if data["status"] == 1}}处理中{{/if}}'+
                    '{{if data["status"] == 2}}待确认{{/if}}'+
                    '{{if data["status"] == 3}}已处理{{/if}}'+
                    '</th>'+
                    '<th><a>删除</a></th>' +
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

function download(name, href) {
  var a = document.createElement("a"), //创建a标签
      e = document.createEvent("MouseEvents"); //创建鼠标事件对象
  e.initEvent("click", false, false); //初始化事件对象
  a.href = href; //设置下载地址
  a.download = name; //设置下载文件名
  a.dispatchEvent(e); //给指定的元素，执行事件click事件
}
