$(function() {
    $(".nav-tabs-li").bind("click", function () {
        $(".nav-tabs-li").removeClass('active');
        $(this).addClass('active');
    })
});

//渲染页面
$(function(){
    $.ajax({
        type: 'post',
        url: '/operator',
        data: {
            action:"get_analyze_list",
            page:0
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                $('.data_list').empty();
                var record_item = '{{each data_list as data}}'+
                    '<tr>' +
                    '<td>{{data["id"]}}</td>' +
                    '<td>{{data["admin_affiliation"]}}</td>' +
                    '<td>{{data["describe"}}</td>' +
                    '<td>'+
                    '{{if data["status"] == 0}}未分配{{/if}}'+
                    '{{if data["status"] == 1 || data["status"] == 2}}处理中{{/if}}'+
                    '{{if data["status"] == 3}}已处理{{/if}}'+
                    '</td>'+
                    '<td>'+
                    '{{if data["status"] == 0}}<a>分配</a>{{/if}}'+
                    '{{if data["status"] == 1 || data["status"] == 2}}<a>下载数据</a>&nbsp&nbsp<a>联系上传人员</a>&nbsp&nbsp<a>上传反馈材料</a>{{/if}}'+
                    '{{if data["status"] == 3}}<a>查看</a>{{/if}}'+
                    '</td>'+
                    '</tr>' +
                    '{{/each}}';
                var render = template.compile(record_item);
                var html = render(result);
                $('.data_list').append(html);
            }
        }
    })
});