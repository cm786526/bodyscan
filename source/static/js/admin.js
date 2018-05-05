var _page=0;
var page_sum=0;
var status=0;
$(document).ready(function() {
    //加载数据
    getResultPage(-1, 0);
}).on('change','#InputFile',function(ev){
    //分片上传
    console.log(ev.target.files);
    //预览，主要是文件转换为base64，或者blob，或者canvas
    //file -> base64
    // file为前面获得的
    console.log(ev.target.files[0]);
    var file = ev.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
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
    var totalPieces, sended_num;
    var blob = file;
    var start = 0;
    var end;
    var index = 0;
    var filesize = blob.size;
    var filename = blob.name;

    //计算文件切片总数
    totalPieces = Math.ceil(filesize / bytesPerPiece);
    sended_num = 0;
    while (start < filesize) {
        //判断是否是最后一片文件，如果是最后一篇就说明整个文件已经上传完成
        if (index === totalPieces) {
            console.log('整个文件上传完成');
            return false;
        }
        end = start + bytesPerPiece;
        if (end > filesize) {
            end = filesize;
        }
        var chunk = blob.slice(start, end);//切割文件
        var sliceIndex = index;
        var formData = new FormData();
        formData.append("file", chunk, filename);
        formData.append("total", totalPieces);  //总片数
        formData.append("index", sliceIndex);   //当前是第几片
        var xhr = new XMLHttpRequest();

        //上传文件进度条
        xhr.upload.addEventListener("progress", function (e) {
            if (e.total > 0) {
                console.log('----进度-----');
                //e.percent = Math.round(e.loaded / e.total * 100);
                //(e.loaded当前片文件上传的上传的进度 start是前面分片已经上传完成的文件大小
                e.percent = 100 * (e.loaded + start) / file.size;
                if (e.percent > 100) {
                    e.percent = 100;
                }
                console.log(e.percent);
                console.log('----进度-----');
                $('#progressbar').LineProgressbar({
                    percentage: e.percent,
                    fillBackgroundColor: '#337ab7',
                    height: '20px',
                    radius: '50px'
                });
            }
        }, false);
        url = 'http://bodyscan.com.cn:9999/fileupload?action=chunk_upload';
        xhr.open('post', url, true);
        xhr.onload = function () {
            sended_num++;
            if (sended_num === totalPieces) {
                // 给后台发送合并文件请求
                merge_file(filename, totalPieces);
            }
        };
        xhr.send(formData);
        start = end;
        index++;
    }
    /*********************************************尝试分片****************************************/

}).on('click','.pre-page',function(){
    if(_page==0){
        return Tip('没有上一页啦！');
    }else{
        _page--;
        getResultPage(status,_page);
        $('.page-now').text(_page+1);
    }
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
}).on('click',".nav-tabs-li",function(){
    //切换状态
    $(".nav-tabs-li").removeClass('active');
    $(this).addClass('active');
    status = $(this).val();
    getResultPage(status, 0);
}).on('click','#btn-submit',function(){
    var $uploadTable = $('#upload-table');
    //提交表单
    var str = $uploadTable.find('#InputFile').val();
    var index = str.lastIndexOf("\\");
    str = str.substring(index + 1,str.length);
    if(str==""){
        Tip("上传材料不能为空");
        return;
    }
    var patient_name=$uploadTable.find('#Input1').val();
    if(patient_name==""){
        Tip("病人姓名不能为空");
        return;
    }
    var patient_idnumber=$uploadTable.find('#Input2').val();
    if(!IdentityCodeValid(patient_idnumber)){
        Tip("身份证号格式不对");
        return;
    }
    var sex=$uploadTable.find('.radio-active').data('id');
    var describe=$uploadTable.find('#Input3').val();
    var measuring_position=$uploadTable.find('#Input4').val();
    var measuring_method=$uploadTable.find('#Input5').val();
    var measuring_date=$uploadTable.find('#date').val();
    if(measuring_date==""){
        Tip("测量日期不能为空");
        return;
    }
    //通过ajax提交请求
    $.ajax({
        type: 'post',
        url: '/admin',
        data: {
            action:"add_analyze_request",
            patient_name: patient_name,
            patient_idnumber: patient_idnumber,
            sex:sex,
            describe: describe,
            measuring_position: measuring_position,
            measuring_method: measuring_method,
            measuring_date: measuring_date,
            file_name: str
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                //表单提交成功
                window.location.href = "/admin";
            }
        }
    });
}).on('click','#edit-submit',function(){
    var $uploadTable = $('#upload-table');
    //提交修改数据表单
    var str = $uploadTable.find('#InputFile').val();
    var index = str.lastIndexOf("\\");
    str = str.substring(index + 1,str.length);
    if(str==""){
        Tip("上传材料不能为空");
        return;
    }
    var patient_name=$uploadTable.find('#Input1').val();
    if(patient_name==""){
        Tip("病人姓名不能为空");
        return;
    }
    var patient_idnumber=$uploadTable.find('#Input2').val();
    if(!IdentityCodeValid(patient_idnumber)){
        Tip("身份证号格式不对");
        return;
    }
    var sex=$uploadTable.find('.radio-active').data('id');
    var describe=$uploadTable.find('#Input3').val();
    var measuring_position=$uploadTable.find('#Input4').val();
    var measuring_method=$uploadTable.find('#Input5').val();
    var measuring_date=$uploadTable.find('#date').val();
    if(measuring_date==""){
        Tip("测量日期不能为空");
        return;
    }
    //通过ajax提交请求
    $.ajax({
        type: 'post',
        url: '/admin',
        data: {
            action:"edit_analyze_request",
            patient_name: $uploadTable.find('#Input1').val(),
            patient_idnumber: $uploadTable.find('#Input2').val(),
            sex:$uploadTable.find('.radio-active').data('id'),
            describe: $uploadTable.find('#Input3').val(),
            measuring_position: $uploadTable.find('#Input4').val(),
            measuring_method: $uploadTable.find('#Input5').val(),
            measuring_date: $uploadTable.find('#date').val(),
            file_name: str
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                //表单提交成功
                window.location.href = "/admin";
            }
        }
    })
}).on('blur','#Input2',function(){
    IdentityCodeValid($('#Input2').val())
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
        $("#zb-tip").remove();
    },2000);
}

//确认
function confirmData(analyze_id){
    $.ajax({
        type: 'post',
        url: '/admin',
        data: {
            action:"confirm_data",
            analyze_id:analyze_id
        },
        dataType:'json',
        success:function (result) {
            if(result.success){
                //确认成功
                getResultPage(status,_page)
            }
        }
    })
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
                    '{{if data["status"] == 0||data["status"] == 1}}<a class="edit" href="/admin?action=edit_record&record_id={{data["id"]}}">修改数据</a>&nbsp&nbsp<a>联系操作员</a>{{/if}}'+
                    '{{if data["status"] == 2}}<a href="/filedownload?filename={{data["feedback_name"]}}" target="_blank">下载</a>&nbsp&nbsp<a class="edit" href="/admin?action=add_record&record_id={{data["id"]}}">修改数据</a>&nbsp&nbsp<a onclick="confirmData({{data["id"]}})">确认</a>{{/if}}'+
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

/*
根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
    地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
    出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
    顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
    校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

出生日期计算方法。
    15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
    2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
下面是正则表达式:
 出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
 身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i
 15位校验规则 6位地址编码+6位出生日期+3位顺序号
 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位

 校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
                公式(1)中：
                i----表示号码字符从由至左包括校验码在内的位置序号；
                ai----表示第i位置上的号码字符值；
                Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
                i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
                Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1

*/
//身份证号合法性验证
//支持15位和18位身份证号
//支持地址编码、出生日期、校验位验证
function IdentityCodeValid(code) {
    var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
    var pass= true;

    if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
        pass = false;
    }

    else if(!city[code.substr(0,2)]){
        pass = false;
    }
    else{
        //18位身份证需要验证最后一位校验位
        if(code.length == 18){
            code = code.split('');
            //∑(ai×Wi)(mod 11)
            //加权因子
            var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
            //校验位
            var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++)
            {
                ai = code[i];
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            if(parity[sum % 11] != code[17]){
                pass =false;
            }
        }
    }
    if(!pass) Tip('身份证格式错误！请重新填写');
    return pass;
}