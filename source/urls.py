# 头部引入handlers中的模块
import handlers.login
import handlers.common
import handlers.admin
import handlers.recorder
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
    (r"/admin/shopmanage", handlers.admin.ShopManage, {}, "shopmanage"),                                    # 门店管理
    (r"/admin/goodsmanage", handlers.admin.GoodsManage, {}, "admingoodsmanage"),                            # 管理员-商品管理
    (r"/admin/staffmanage", handlers.admin.StaffManage, {}, "staffmanage"),                                 # 员工管理                                       # 员工管理

    #录入员
    (r"/recorder/goodsmanage", handlers.recorder.GoodsManage, {}, "recordergoodsmanage"),                   # 录入员-商品管理
    (r"/recorder/record", handlers.recorder.Record, {}, "record"),                                          # 记录
    (r"/recorder/settings", handlers.recorder.Settings, {}, 'settings'),                                    # 设置
    (r"/recorder/enteringgoods", handlers.recorder.EnteringGoods, {}, 'recorderenteringgoods'),             # 商品录入
]
