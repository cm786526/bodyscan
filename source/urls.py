# 头部引入handlers中的模块
import handlers.login
import handlers.common
import handlers.admin
import handlers.operator
# urls.py
handlers = [
    # 登录
    (r"/login", handlers.login.Login, {"action":"login"}, "Login"),                                        # 登录
    (r"/logout", handlers.login.Login, {"action":"logout"}, "Logout"),                                     # 退出
    (r"/login/oauth", handlers.login.Login, {"action":"oauth"}, "oauth"),                                  # 微信授权回调
    (r"/login/phonebind", handlers.login.PhoneBind, {}, "PhoneBind"),                                      # 微信登录后绑定手机号
    (r"/common/logincode", handlers.common.LoginVerifyCode, {}, 'commonLoginVerifyCode'),                  # 登录/注册验证码
    (r"/common/profile", handlers.common.Profile, {}, 'commonProfile'),                  				   # 个人中心
    (r"/updatewebsocket", handlers.common.UpdateWebSocket, {}, 'commonUpdateWebSocket'),                   # websocket获取更新数据
    (r"/fileupload", handlers.common.FileUploadHandler, {}, 'commonFileUploadHandler'),                    # 上传文件接口
    (r"/filedownload", handlers.common.FileDownloadHandler, {}, 'commonFileDownloadHandler'),              # 上传下载接口
    #管理员
    (r"/admin", handlers.admin.Home, {}, "adminhome"),                                                       # 管理员首页
    (r"/admin/staffmanage", handlers.admin.StaffManage, {}, "staffmanage"),                                  # 员工管理                                       # 员工管理

    #操作员
    (r"/operator", handlers.operator.Home, {}, "recorderhome"),                                             # 操作员首页
    (r"/operator/goodsmanage", handlers.operator.GoodsManage, {}, "recordergoodsmanage"),                   # 录入员-商品管理

    ]
