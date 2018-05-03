var _page=0;
var page_sum=0;
var status=0
$(document).ready(function(){
    //加载数据
    getResultPage(-1,0);
    //分片上传
    document.getElementById('InputFile').addEventListener('change', function (ev) {
        console.log(ev.target.files);
        //预览，主要是文件转换为base64，或者blob，或者canvas
        //file -> base64
        // file为前面获得的
        console.log(ev.target.files[0]);
        var file = ev.target.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image;
            img.src = this.result;  // this.result 为base64
            //console.log(this.result)
            // 加到dom
        };
        reader.readAsDataURL(file);
        var url = window.URL.createObjectURL(file);
        var img = new Image;
        img.src = url;
        //console.log(img)
        // 加到dom
        console.log(file);
        /*********************************************尝试分片，创建多个上传的xhr对象****************************************/
        var bytesPerPiece = 5 * 1024 * 1024; // 每个文件切片大小定为1MB
        var totalPieces,sended_num;
        var blob = file;
        var start = 0;
        var end;
        var index = 0;
        var filesize = blob.size;
        var filename = blob.name;

        //计算文件切片总数
        totalPieces = Math.ceil(filesize / bytesPerPiece);
        sended_num=0;
        while(start < filesize) {
            //判断是否是最后一片文件，如果是最后一篇就说明整个文件已经上传完成
            if (index === totalPieces) {
                console.log('整个文件上传完成');
                return false;
            }
            end = start + bytesPerPiece;
            if(end > filesize) {
                end = filesize;
            }
            var chunk = blob.slice(start,end);//切割文件
            var sliceIndex = index;
            var formData = new FormData();
            formData.append("file", chunk, filename);
            formData.append("total", totalPieces);  //总片数
            formData.append("index", sliceIndex);   //当前是第几片
            var xhr = new XMLHttpRequest();
            //上传文件进度条
            xhr.upload.addEventListener("progress", function(e){
                if (e.total > 0) {
                    console.log('----进度-----');
                    //e.percent = Math.round(e.loaded / e.total * 100);
                    //(e.loaded当前片文件上传的上传的进度 start是前面分片已经上传完成的文件大小
                    e.percent = 100*(e.loaded+start)/file.size;
                    if(e.percent > 100){
                        e.percent = 100;
                    }
                    console.log( e.percent);
                    console.log('----进度-----')
                }
            }, false);
            url = 'http://bodyscan.com.cn:9999/fileupload?action=chunk_upload';
            xhr.open('post', url, true);
            xhr.onload = function () {
                sended_num++;
                if (sended_num===totalPieces){
                    // 给后台发送合并文件请求
                    merge_file(filename,totalPieces);
                }
            };
            xhr.send(formData);
            start = end;
            index++;
        }
        /*********************************************尝试分片****************************************/
    });
}).on('click','.pre-page',function(){
    if(_page==0){
        return Tip('没有上一页啦！');
    }else{
        _page--;
        getResultPage(status,_page);
        $('.page-now').text(_page+1);
    }
}).on('click','.next-page',function(){
    if(_page==(page_sum-1)){
        return Tip('没有下一页啦！');
    }else{
        _page++;
        getResultPage(status,_page);
        $('.page-now').text(_page+1);
    }
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
}).on('click',".nav-tabs-li",function(){
    //切换状态
    $(".nav-tabs-li").removeClass('active');
    $(this).addClass('active');
    status=$(this).val();
    getResultPage(status,0);
}).on('click','#btn-submit',function(){
    var $formDiv = $('#form-div');
    //提交表单
    $formDiv.find('#btn-submit').on('click',function () {
        var str = $formDiv.find('#InputFile').val();
        var index = str.lastIndexOf("\\");
        str = str.substring(index + 1,str.length);
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/admin',
            data: {
                action:"add_analyze_request",
                patient_name: $formDiv.find('#Input1').val(),
                patient_idnumber: $formDiv.find('#Input2').val(),
                sex:$formDiv.find('[type="radio"]:checked').val(),
                describe: $formDiv.find('#Input3').val(),
                measuring_position: $formDiv.find('#Input4').val(),
                measuring_method: $formDiv.find('#Input5').val(),
                measuring_date: $formDiv.find('#Input6').val(),
                file_name: str
            },
            dataType:'json',
            success:function (result) {
                $formDiv.find('.help-block').html('上传成功');
                if(result.success){
                    //表单提交成功
                    window.location.href = "/admin";
                }
            }
        })
    });
});


// 发送文件合并请求
function merge_file(filename,totalPieces){
    var url = "/fileupload";
    var args = {
        action: 'merge_file',
        file_name: filename,
        total_chunk:totalPieces
    };
    $.post(url, args, function(res){
        if(res.success){
            Tip("成功上传文件");
        }else{
            Tip(res.error_text);
        }
    })
}

//提示框
function Tip(text){
    var tip = '<div class="zb-tip" id="zb-tip">'+text+'</div>';
    $("body").append(tip);
    zb_timer = setTimeout(function(){
        $("#zb-tip").empty();
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
                    '<td>{{data["id"]}}</td>' +
                    '<td>{{data["patient_name"]}}</td>' +
                    '<td>'+
                    '{{if data["status"] == 0}}未领取{{/if}}'+
                    '{{if data["status"] == 1}}处理中{{/if}}'+
                    '{{if data["status"] == 2}}待确认{{/if}}'+
                    '{{if data["status"] == 3}}已处理{{/if}}'+
                    '</td>'+
                    '<td>'+
                    '{{if data["status"] == 0||data["status"] == 1}}<a href="/admin?action=edit_record&record_id={{data["id"]}}">修改数据</a>&nbsp&nbsp<a>联系操作员</a>{{/if}}'+
                    '{{if data["status"] == 2}}<a>下载</a>&nbsp&nbsp<a href="/admin?action=add_record&record_id={{data["id"]}}">修改数据</a>&nbsp&nbsp<a>确认</a>{{/if}}'+
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
