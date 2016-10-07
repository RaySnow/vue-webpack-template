/**
 * Created by hupo on 16/8/30.
 */

/* 微信 & QQ & 支付宝 & 百度统计 jsSdk 的封装
 *
 * 不依赖任何其他js文件
 *
 * 请使用全局的 "JsSdkUtil" 或 "window.JsSdkUtil"
 *
 * 在此js文件加载后(可以是加载后的任何地方), 根据所需要使用的功能, 配置 JsSdkUtil, 配置完成后, 显式调用 JsSdkUtil.initialize() 执行初始化
 *
 * 使用示例:
 *      <script src="../js/jsSdkUtil.js"></script>                  加载此文件
 *      <script>
 *              JsSdkUtil.scanCodeId = "scanCode"; (或 JsSdkUtil.scanCodeId = "wrapper"; JsSdkUtil.scanCodeConfirmId = "scanCode";)    根据需要配置所使用的功能 (可选)
 *              JsSdkUtil.scanCallback = function (result) {        配置功能回调 (可选)
 *                    console.log("scanCallback run");
 *                    window.location.href = result
 *              };
 *              JsSdkUtil.initialize()                               初始化 (必须)
 *      </script>
 */

(function () {
    var BASE_URL = "http://api.l.whereask.com";
    //grunt打包时的环境参数
    var grunt_env = "grunt_env_daily";
    if (grunt_env == 'grunt_env_pre') {
        //预发地址
        BASE_URL = 'http://meal.2dfire-pre.com';
    } else if (grunt_env == 'grunt_env_release') {
        //发布地址
        BASE_URL = 'https://meal.2dfire.com';
    }

    var WX_JS_SDK_URL = "//res.wx.qq.com/open/js/jweixin-1.0.0.js";
    var ALIPAY_JS_SDK_URL = "https://static.alipay.com/aliBridge/1.0.0/aliBridge.min.js";
    var QQ_JS_SDK_URL = "https://mp.gtimg.cn/open/js/openApi.js";
    var QQ_PAY_JS_SDK_URL = "http://pub.idqqimg.com/qqmobile/qqapi.js?_bid=152";
    var BAIDU_ANALYSIS_URL = "//hm.baidu.com/hm.js?24910471637fcf3fc7f8a730579094d1";
    var WX_CONFIG_URL = BASE_URL + "/share/v1/get_jsapi_ticket";
    var QQ_CONFIG_URL = BASE_URL + "/share/v1/get_qq_jsapi_ticket";
    var SHARE_INFO = BASE_URL + "/shop/v1/:id/share"; //获取分享所需的数据

    var client, jsSdk, JsSdkUtil;
    var isInit = false;                      // 是否已经开始初始化
    var isGetShareDataRetry = false;         // 获取分享信息失败重试一次
    var isGetSdkConfigRetry = false;         // 获取分享信息失败重试一次

    JsSdkUtil = {
        debug: false,                        // 是否开启微信或qqSDk的调试  默认关闭
        client: undefined,                        // 是否开启微信或qqSDk的调试  默认关闭
        useShare: true,                      // 是否使用分享功能(包括朋友圈和分享给好友) 默认开启
        useHideMenu: true,                   // 是否使用隐藏菜单功能 默认开启
        useLocation: false,                  // 是否使用定位功能  默认关闭
        scanCodeId: undefined,               // 是否使用扫码功能(直接指定 dom ID 自动开启, 应保证事件绑定时此ID对应的DOM已存在) 默认关闭
        scanCodeConfirmId: undefined,        // 此时 scanCodeId 作为wrapper用来绑定事件, scanCodeConfirmId 作为实际触发的 target (主要用于处理事件绑定时,扫码DOM元素还未生成的情况)
        shareInfo: undefined,                // 分享的内容, 默认使用获取分享内容的接口
        HideMenuList: undefined,             // 隐藏的menuList, 有默认list,可以不传
        scanCallback: undefined,             // 扫码后的回调, 默认自动跳转到扫码地址
        locationCallback: undefined,         // 定位后的回调, 默认设置到 sessionStorage 名称: gps
        shareCallback: undefined,            // 分享成功后的回调, 默认无
        initialize: initialize,              // sdk配置初始化, 请再此文件加载后调用 (必须!)
        bindShareData: bindShareData         // 绑定分享数据, 用于需要临时指定分享内容的情况
    };
    window.JsSdkUtil = JsSdkUtil;

    /*
     *  工具类方法 start
     */
    // 简单封装 ajax 只用 get 方法
    function ajax(url, arg1, arg2, arg3) {
        var params, success, error;
        if (typeof(arg1) == "object") {
            params = arg1;
            success = arg2;
            error = arg3
        } else {
            params = undefined;
            success = arg1;
            error = arg2
        }

        var xmlHttp = new XMLHttpRequest();

        if (params && Object.keys(params).length > 0) {
            url += "?";
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    url = url + k + "=" + encodeURIComponent(params[k]) + "&"
                }
            }
            if (url[url.length - 1] === "&") {
                url = url.slice(0, -1)
            }
        }

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    var resp = JSON.parse(xmlHttp.responseText);
                    if (resp.code == 1 && success) {
                        success(resp.data)
                    } else if (error) {
                        error(resp)
                    }
                } else if (error) {
                    error("error status: " + xmlHttp.status)
                }
            }
        };
        xmlHttp.open("get", url, true);
        xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
        xmlHttp.timeout = 15000;
        xmlHttp.ontimeout = function () {
            error("timeout")
        };
        xmlHttp.send();
    }

    // 简单封装获取 cookie 的方法
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].replace(/.*\s/, "");
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 动态加载sdk和指定回调
    function loadScript(src, callback) {
        var script = document.createElement('script');
        var head = document.getElementsByTagName('head')[0];
        script.type = 'text/javascript';
        script.charset = 'UTF-8';
        script.src = src;
        script.onload = function () {
            if (callback) {
                callback();
            }
            script.onLoad = null
        };
        head.appendChild(script);
    }

    // 地址栏参数替换 url 原始地址:如/hello/:id/    arg 如果只有一个参数,则为string,多个需传递数组
    function api_get_request_url(url, arg) {
        if (typeof arg === "string") {
            return url.replace(':id', arg);
        } else if (typeof arg === "object" && arg.length > 0) {
            return api_get_request_url(url.replace(':id', arg[0]), arg.slice(1, arg.length));
        } else {
            return url;
        }
    }

    /* 工具类方法 end */

    // 设置 js api config 到 sessionStorage
    function setJsApi(page, data) {
        var obj = {};
        obj.time = new Date().getTime();
        obj.data = data;
        sessionStorage.setItem(page, JSON.stringify(obj));
    }
    function getJsApi(page) {
        var result = JSON.parse(sessionStorage.getItem(page));
        try {
            if (new Date().getTime() - result.time > 1.5 * 60 * 60 * 100) {
                result = null;
            } else {
                result = result.data;
            }
        } catch (ex) {
            result = null;
        }
        return result;
    }

    // 设置 shareInfo 到 sessionStorage
    function setShareInfo(shareInfo) {
        if (typeof shareInfo === "object" && shareInfo != null) {
            shareInfo = JSON.stringify(shareInfo);
        } else {
            shareInfo = "";
        }
        sessionStorage.setItem("shareInfo", shareInfo);
    }

    function getShareInfo() {
        var shareInfo = {};
        try {
            shareInfo = JSON.parse(sessionStorage.getItem("shareInfo"));
        } catch (ex) {
            console.log("share need init");
        }
        return shareInfo;
    }

    // 初始化sdk
    function initialize() {
        isInit = true;
        // client有值说明scriptInit先完成, 那么在此处初始化, client无值说明scriptInit后完成, 则在scriptInit回调中自动初始化. 以此保证初始化绝对执行
        if (client === 1) {
            getSdkConfig(WX_CONFIG_URL)
        } else if (client === 2) {
            aliPayInit()
        } else if (client === 3) {
            getSdkConfig(QQ_CONFIG_URL)
        }
    }

    // 获取sdk验证信息
    function getSdkConfig(url) {
        var page = "jsapi-" + window.location.href.match(/page\/.*?\.html/)[0];
        var jsApi = getJsApi(page);
        if (jsApi) {
            wxQqInit(jsApi)
        } else {
            ajax(url, {url: window.location.href}, function (resp) {
                    wxQqInit(resp);
                    setJsApi(page, resp)
                }, function (resp) {
                    if (!isGetSdkConfigRetry) {
                        isGetSdkConfigRetry = true;
                        getSdkConfig(url)
                }
                }
            )
        }
    }

    // 获取分享数据
    function getShareData() {
        var entityId = getCookie('entity_id');
        var token = getCookie('token');
        if (entityId) {
            var url = api_get_request_url(SHARE_INFO, entityId);
            ajax(url, {xtoken: token}, function (resp) {
                    bindShareData(resp);
                setShareInfo(resp)
                }, function (resp) {
                if (!isGetShareDataRetry) {
                    isGetShareDataRetry = true;
                    getShareData()
                }
                }
            )
        }
    }

    // 调用分享接口
    function bindShareData(shareInfo) {
        var friend = shareInfo.friend;//朋友
        var moment = shareInfo.moment;//朋友圈
        jsSdk.showMenuItems({
            menuList: ["menuItem:share:appMessage", "menuItem:share:timeline"] // 要显示的菜单项，所有menu项见附录3
        });
        //分享给朋友
        jsSdk.onMenuShareAppMessage({
            title: friend.title, // 分享标题
            desc: friend.memo, // 分享描述
            link: friend.shopUrl, // 分享链接
            imgUrl: friend.imgUrl || "../images/shop/wechatshare.png", // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                if (JsSdkUtil.shareCallback) {
                    JsSdkUtil.shareCallback("shareToFriend")
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享到朋友圈
        jsSdk.onMenuShareTimeline({
            title: moment.title, // 分享标题
            link: moment.shopUrl, // 分享链接
            imgUrl: moment.imgUrl || "../images/shop/wechatshare.png", // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                if (JsSdkUtil.shareCallback) {
                    JsSdkUtil.shareCallback("shareToTimeLine")
                }
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    }

    /*
     *  wx 和 qq 初始化
     */
    function wxQqInit(config) {
        jsSdk.config({
            debug: JsSdkUtil.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: config.appId, // 必填，公众号的唯一标识
            timestamp: config.timestamp, // 必填，生成签名的时间戳
            nonceStr: config.noncestr, // 必填，生成签名的随机串
            signature: config.sign,// 必填，签名，见附录1
            jsApiList: ["getLocation", "onMenuShareTimeline", "onMenuShareAppMessage", "scanQRCode", "hideMenuItems",
                "showMenuItems", "getNetworkType"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        //这里把checkApi改为ready，因为版本较低的微信不支持check
        jsSdk.ready(function () {
            if (JsSdkUtil.useHideMenu) {
                var menuList = ["menuItem:favorite",
                    "menuItem:share:qq",
                    "menuItem:copyUrl",
                    "menuItem:openWithQQBrowser",
                    "menuItem:openWithSafari",
                    "menuItem:share:weiboApp",
                    "menuItem:share:QZone",
                    "menuItem:share:facebook",
                    "menuItem:share:appMessage",
                    "menuItem:share:timeline"]; // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
                jsSdk.hideMenuItems({
                    menuList: (JsSdkUtil.HideMenuList && JsSdkUtil.HideMenuList.length > 0) ? JsSdkUtil.HideMenuList : menuList
                });
            }

            // 微信定位
            if (JsSdkUtil.useLocation) {
                jsSdk.getLocation({
                    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (res) {
                        var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                        var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                        var speed = res.speed; // 速度，以米/每秒计
                        var accuracy = res.accuracy; // 位置精度
                        window.localStorage.removeItem("gps");
                        window.localStorage.setItem("gps", parseInt(longitude * 1000000) + ":" + parseInt(latitude * 1000000) + ":" + speed + ":" + accuracy);
                        if (JsSdkUtil.locationCallback) {
                            JsSdkUtil.locationCallback(res)
                        }
                    },
                    fail: function (res) {
                        console.log('获取位置失败');
                    }
                });
            }

            // 微信扫码
            if (JsSdkUtil.scanCodeId) {
                var scanCodeDom = document.getElementById(JsSdkUtil.scanCodeId);

                function scanQRCode() {
                    jsSdk.scanQRCode({
                        needResult: 1,
                        desc: "scanQRCode desc",
                        success: function (res) {
                            if (JsSdkUtil.scanCallback) {
                                JsSdkUtil.scanCallback(res.resultStr)
                            } else {
                                window.location.href = res.resultStr
                            }
                            return false;
                        }
                    });
                }

                scanCodeDom.addEventListener("click", function (e) {
                    if (JsSdkUtil.scanCodeConfirmId) {
                        if (JsSdkUtil.scanCodeConfirmId === e.target.id) {
                            scanQRCode()
                        }
                    } else {
                        scanQRCode()
                    }
                });
            }

            // 分享接口调用
            if (JsSdkUtil.useShare) {
                var shareData = JsSdkUtil.shareInfo || getShareInfo();
                if (shareData) {
                    bindShareData(shareData);
                } else {
                    getShareData();
                }
            }
        });
    }

    /*
     *  支付宝初始化
     */
    function aliPayInit() {
        // 支付宝扫码
        if (JsSdkUtil.scanCodeId) {
            if ((Ali.alipayVersion).slice(0, 3) >= 8.1) {
                var scanCodeDom = document.getElementById(JsSdkUtil.scanCodeId);

                function scanQRCode() {
                    jsSdk.scan({
                        type: 'qr'  //qr(二维码) / bar(条形码) / card(银行卡号)
                    }, function (result) {
                        if (result.errorCode) {
                            //没有扫码的情况
                            //errorCode=10，用户取消
                            //errorCode=11，操作失败
                            if (result.errorCode == 11) {
                                //alert('操作失败');
                            }
                        } else {
                            //成功扫码的情况
                            if (result.qrCode !== undefined) {
                                if (JsSdkUtil.scanCallback) {
                                    JsSdkUtil.scanCallback(result.qrCode)
                                } else {
                                    window.location.href = result.qrCode
                                }
                            }
                        }
                    });
                }

                scanCodeDom.addEventListener("click", function (e) {
                    if (JsSdkUtil.scanCodeConfirmId) {
                        if (JsSdkUtil.scanCodeConfirmId === e.target.id) {
                            scanQRCode()
                        }
                    } else {
                        scanQRCode()
                    }
                });
            } else {
                Ali.alert({
                    title: '亲',
                    message: '请升级您的钱包到最新版',
                    button: '确定'
                });
            }
        }
    }

    // 根据客户端加载对应的sdk文件
    function scriptInit() {
        var userAgent = navigator.userAgent;
        if (userAgent.indexOf("MicroMessenger") !== -1) {
            loadScript(WX_JS_SDK_URL, function () {
                client = 1;
                // 用 setTimeOut 保证 加载后的jsSdk执行完成
                setTimeout(function () {
                    jsSdk = wx;
                    if (isInit) {
                        getSdkConfig(WX_CONFIG_URL)
                    }
                }, 0);
            });
        } else if (userAgent.indexOf("AlipayClient") !== -1) {
            loadScript(ALIPAY_JS_SDK_URL, function () {
                setTimeout(function () {
                    jsSdk = Ali;
                    client = 2;
                    if (isInit) {
                        aliPayInit()
                    }
                }, 0);
            });
        } else if (userAgent.indexOf("QQ") !== -1) {
            loadScript(QQ_JS_SDK_URL, function () {
                // 加载qq钱包
                loadScript(QQ_PAY_JS_SDK_URL, function () {
                });
                setTimeout(function () {
                    jsSdk = mqq;
                    client = 3;
                    if (isInit) {
                        getSdkConfig(QQ_CONFIG_URL)
                    }
                }, 0);
            });
        }
        // 加载百度统计脚本
        loadScript(BAIDU_ANALYSIS_URL)
    }
    scriptInit()

})();