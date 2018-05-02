#human.digital.cc

1.修改hosts文件"/etc/hosts"，添加一行"127.0.0.1       human.digital.cc"
2.本地建一个数据库digital

# 2018.5.2修改 by 邹琪珺
## status含义
状态 0 - 上传完未分配，在admin显示：处理中，在operator显示：未分配

状态 1 - 已分配，在admin显示：处理中，在operator显示：处理中

状态 2 - 已处理并返回数据，但未确认，在admin显示：待确认，在operator显示：处理中

状态 3 - 已确认，在admin显示：已处理，在operator显示：已处理

## 已修改
sex：传1是男 传2是女

file_name：已取到正确的文件名

上传新数据已可以使用Tip，暂时未复用到其他页面

渲染页面时增加了一个参数：tab

对于admin  --- 0：全部，1：处理中，2：待确认，3：已处理

对于operator： --- 0：全部，1：未分配，2：处理中，3：已处理

（点击后列表是否重新加载还需确认）

operator渲染页面已做好

## 现数据缺少的记录
1.上传机构->在个人中心添加

2.数据属于哪个操作员（null的时候所有人都能看到，分配后固定给某人）

## 已完成
完成了edit页面 - 需要传入数据data - 页面：edit_record.html
```
<a href="/admin?action=add_record&id={{data["id"]}}">修改数据</a>
```
(这里不知道需不需要把id传给你)

完成了个人中心 - 页面：personal.html
```
<a href="/admin?action=personal"></a>
```
