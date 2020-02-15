App({
  data: {
    // 用户登录缓存key
    cache_user_login_key: "cache_user_login_key",

    // 用户信息缓存key
    cache_user_info_key: "cache_shop_user_info_key",

    // 用户站点信息缓存key
    cache_user_merchant_key: "cache_shop_user_merchant_key",

    // 设备信息缓存key
    cache_system_info_key: "cache_shop_system_info_key",

    // 用户地址选择缓存key
    cache_buy_user_address_select_key: "cache_buy_user_address_select_key",

    // 用户传入信息缓存key
    cache_launch_info_key: "cache_shop_launch_info_key",

    // 默认用户头像
    default_user_head_src: "/images/default-user.png",

    // 成功圆形提示图片
    default_round_success_icon: "/images/default-round-success-icon.png",

    // 错误圆形提示图片
    default_round_error_icon: "/images/default-round-error-icon.png",

    // tabbar页面
    tabbar_pages: [
      "/pages/index/index",
      "/pages/goods-category/goods-category",
      "/pages/cart/cart",
      "/pages/user/user",
    ],

    // 页面标题
    common_pages_title: {
      "goods_search": "商品搜索",
      "goods_detail": "商品详情",
      "goods_attribute": "属性",
      "user_address": "我的地址",
      "user_address_save_add": "新增地址",
      "user_address_save_edit": "编辑地址",
      "buy": "订单确认",
      "user_order": "我的订单",
      "user_order_detail": "订单详情",
      "user_favor": "我的收藏",
      "answer_form": "留言",
      "answer_list": "问答",
      "user_answer_list": "我的留言",
      "user": "用户中心",
      "goods_category": "分类",
      "cart": "购物车",
      "message": "消息",
      "user_integral": "我的积分",
      "user_goods_browse": "我的足迹",
      "goods_comment": "商品评论",
      "user_orderaftersale": "退款/售后",
      "user_orderaftersale_detail": "订单售后",
      "user_order_comments": "订单评论",
      "coupon": "领劵中心",
      "user_coupon": "优惠劵",
      "extraction_address": "自提地址",
    },

    // 请求地址
    request_url: "{{request_url}}",
    // request_url: 'http://shopxo.com/',
    // request_url: 'http://dev.shopxo.net/',

    // 基础信息
    application_title: "{{application_title}}",
    application_describe: "{{application_describe}}",

    // 价格符号
    price_symbol: "{{price_symbol}}"
  },

  /**
   * 小程序初始化
   */
  onLaunch(options) {
    // 设置设备信息
    this.set_system_info();

    // 参数缓存
    my.setStorage({
      key: this.data.cache_launch_info_key,
      data: options.query || null
    });
    // 启动query参数处理
    this.startup_query(options.query);
  },

  /**
   * 启动query参数处理
   */
  startup_query(params) {
    // 没有启动参数则返回
    if ((params || null) == null) {
      return false;
    }

    // 启动处理类型
    var type = params.type || null;
    switch (type) {
      // type=page
      case "page":
        // 页面
        var page = params.page || null;

        // 参数名
        var params_field = params.params_field || null;

        // 参数值
        var params_value = params.params_value || null;

        // 页面跳转
        if(page != null)
        {
          my.navigateTo({
            url: "/pages/" + page + "/" + page + "?" + params_field + "=" + params_value
          });
        }
        break;

      // type=view
      case "view" :
        var url = params.url || null;

        // 页面跳转
        if(url != null)
        {
          my.navigateTo({
            url: '/pages/web-view/web-view?url='+url
          });
        }
        break;

      // 默认
      default:
        break;
    }
  },

  /**
   * 获取设备信息
   */
  get_system_info() {
    let system_info = my.getStorageSync({
      key: this.data.cache_system_info_key
    });
    if ((system_info.data || null) == null) {
      return this.set_system_info();
    }
    return system_info.data;
  },

  /**
   * 设置设备信息
   */
  set_system_info() {
    var system_info = my.getSystemInfoSync();
    my.setStorage({
      key: this.data.cache_system_info_key,
      data: system_info
    });
    return system_info;
  },

  /**
   * 请求地址生成
   * a              方法
   * c              控制器
   * plugins        插件标记（传参则表示为插件请求）
   * params         url请求参数
   */
  get_request_url(a, c, plugins, params) {
    a = a || "index";
    c = c || "index";

    // 是否插件请求
    var plugins_params = "";
    if ((plugins || null) != null)
    {
      plugins_params = "&pluginsname=" + plugins + "&pluginscontrol=" + c + "&pluginsaction=" + a;

      // 走api统一插件调用控制器
      c = "plugins"
      a = "index"
    }

    // 参数处理
    params = params || "";
    if (params != "" && params.substr(0, 1) != "&") {
      params = "&" + params;
    }

    // 用户信息
    var user = this.get_user_cache_info();
    var token = (user == false) ? '' : user.token || '';
    return this.data.request_url +
      "index.php?s=/api/" + c + "/" + a + plugins_params+
      "&application=app&application_client_type=alipay" +
      "&token=" +
      token +
      "&ajax=ajax" +
      params;
  },

  /**
   * 获取用户信息,信息不存在则唤醒授权
   * object     回调操作对象
   * method     回调操作对象的函数
   * return     有用户数据直接返回, 则回调调用者
   */
  get_user_info(object, method) {
    var user = this.get_user_cache_info();
    if (user == false) {
      // 唤醒用户授权
      this.user_login(object, method);

      return false;
    } else {
      return user;
    }
  },

  /**
   * 从缓存获取用户信息
   */
  get_user_cache_info() {
    var user = my.getStorageSync({ key: this.data.cache_user_info_key });
    if ((user.data || null) == null) {
      return false;
    }
    return user.data;
  },

  /**
   * 用户登录
   * object     回调操作对象
   * method     回调操作对象的函数
   * auth_data  授权数据
   */
  user_auth_login(object, method, auth_data) {
    var openid = my.getStorageSync({key: this.data.cache_user_login_key});
    if ((openid.data || null) == null)
    {
      this.user_login(object, method);
    } else {
      this.get_user_login_info(object, method, openid.data, auth_data);
    }
  },

  /**
   * 用户授权
   * object     回调操作对象
   * method     回调操作对象的函数
   */
  user_login(object, method) {
    var openid = my.getStorageSync({key: this.data.cache_user_login_key});
    if ((openid.data || null) == null)
    {
      var self = this;
      // 加载loding
      my.showLoading({ content: "授权中..." });

      // 请求授权接口
      my.getAuthCode({
        scopes: "auth_base",
        success: res => {
          if (res.authCode) {
            my.request({
              url: self.get_request_url("alipayuserauth", "user"),
              method: "POST",
              data: {authcode: res.authCode},
              dataType: "json",
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              success: res => {
                my.hideLoading();
                if (res.data.code == 0) {
                  var data = res.data.data;
                  if((data.is_alipay_user_exist || 0) == 1)
                  {
                    my.setStorage({
                      key: self.data.cache_user_info_key,
                      data: data,
                      success: (res) => {
                        if (typeof object === 'object' && (method || null) != null) {
                          object[method]();
                        }
                      },
                      fail: () => {
                        self.showToast('用户信息缓存失败');
                      }
                    });
                  } else {
                    my.setStorageSync({
                      key: self.data.cache_user_login_key,
                      data: data.openid
                    });
                    self.login_to_auth();
                  }
                } else {
                  self.showToast(res.data.msg);
                }
              },
              fail: () => {
                my.hideLoading();
                self.showToast('服务器请求出错');
              }
            });
          }
        },
        fail: e => {
          my.hideLoading();
          self.showToast('授权失败');
        }
      });
    } else {
      this.login_to_auth();
    }
  },

  /**
   * 跳转到登录页面授权
   */
  login_to_auth() {
    my.confirm({
        title: '温馨提示',
        content: '授权用户信息',
        confirmButtonText: '确认',
        cancelButtonText: '暂不',
        success: (result) => {
          if (result.confirm) {
            my.navigateTo({
              url: "/pages/login/login"
            });
          }
        }
      });
  },

  /**
   * 获取用户授权信息
   * object     回调操作对象
   * method     回调操作对象的函数
   * openid     用户openid
   * auth_data  授权数据
   */
  get_user_login_info(object, method, openid, userinfo) {
    // 邀请人参数
    var params = my.getStorageSync({key: this.data.cache_launch_info_key});

    // 请求数据
    my.showLoading({ content: "授权中..." });
    var self = this;
    userinfo['openid'] = openid;
    userinfo['referrer'] = (params.data == null) ? 0 : (params.data.referrer || 0);
    my.request({
      url: self.get_request_url('alipayuserinfo', 'user'),
      method: 'POST',
      data: userinfo,
      dataType: 'json',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      success: (res) => {
        my.hideLoading();
        if (res.data.code == 0) {
          my.setStorage({
            key: self.data.cache_user_info_key,
            data: res.data.data,
            success: (res) => {
              if (typeof object === 'object' && (method || null) != null) {
                object[method]();
              }
            },
            fail: () => {
              self.showToast('用户信息缓存失败');
            }
          });
        } else {
          self.showToast(res.data.msg);
        }
      },
      fail: () => {
        my.hideLoading();
        self.showToast('服务器请求出错');
      },
    });
  },

  /**
   * 获取位置权限
   * object     回调操作对象
   * method     回调操作对象的函数
   */
  use_location(object, method) {
    my.showLoading({ content: "定位中..." });
    var self = this;
    my.getLocation({
      success(res) {
        my.hideLoading();

        // 回调
        if (typeof object === "object" && (method || null) != null) {
          object[method]({ lng: res.longitude, lat: res.latitude, status: 1000 });
        }
      },
      fail(e) {
        my.hideLoading();
        switch (e.error) {
          case 11:
          case 2001:
            my.alert({
              title: "温馨提示",
              content: "点击右上角->关于->右上角->设置->打开地理位置权限",
              buttonText: "我知道了",
              success: () => {
                if (typeof object === "object" && (method || null) != null) {
                  object[method]({ status: 400 });
                }
              }
            });
            break;

          case 12:
            self.showToast("网络异常，请重试[" + e.error + "]");
            break;

          case 13:
            self.showToast("定位失败，请重试[" + e.error + "]");
            break;

          default:
            self.showToast("定位超时，请重试[" + e.error + "]");
        }
      }
    });
  },

  /**
   * 字段数据校验
   * data           待校验的数据, 一维json对象
   * validation     待校验的字段, 格式 [{fields: 'mobile', msg: '请填写手机号码', is_can_zero: 1(是否可以为0)}, ...]
   */
  fields_check(data, validation) {
    for (var i in validation) {
      var temp_value = data[validation[i]["fields"]];
      var temp_is_can_zero = validation[i]["is_can_zero"] || null;
      
      if ((temp_value == undefined || temp_value.length == 0 || temp_value == -1) || (temp_is_can_zero == null && temp_value == 0)
      ) {
        this.showToast(validation[i]["msg"]);
        return false;
      }
    }
    return true;
  },

  /**
   * 获取当前时间戳
   */
  get_timestamp() {
    return parseInt(new Date().getTime() / 1000);
  },

  /**
   * 获取日期
   * format       日期格式（默认 yyyy-MM-dd h:m:s）
   * timestamp    时间戳（默认当前时间戳）
   */
  get_date(format, timestamp) {
    var d = new Date((timestamp || this.get_timestamp()) * 1000);
    var date = {
      "M+": d.getMonth() + 1,
      "d+": d.getDate(),
      "h+": d.getHours(),
      "m+": d.getMinutes(),
      "s+": d.getSeconds(),
      "q+": Math.floor((d.getMonth() + 3) / 3),
      "S+": d.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(
        RegExp.$1,
        (d.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? date[k]
            : ("00" + date[k]).substr(("" + date[k]).length)
        );
      }
    }
    return format;
  },

  /**
   * 获取对象、数组的长度、元素个数
   * obj      要计算长度的元素（object、array、string）
   */
  get_length(obj) {
    var obj_type = typeof obj;
    if (obj_type == "string") {
      return obj.length;
    } else if (obj_type == "object") {
      var obj_len = 0;
      for (var i in obj) {
        obj_len++;
      }
      return obj_len;
    }
    return false;
  },

  /**
   * 价格保留两位小数
   * price      价格保留两位小数
   */
  price_two_decimal(x) {
    var f_x = parseFloat(x);
    if (isNaN(f_x)) {
      return 0;
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf(".");
    if (pos_decimal < 0) {
      pos_decimal = s_x.length;
      s_x += ".";
    }
    while (s_x.length <= pos_decimal + 2) {
      s_x += "0";
    }
    return s_x;
  },

  /**
   * 当前地址是否存在tabbar中
   */
  is_tabbar_pages(url) {
    if (url.indexOf("?") == -1)
    {
      var value = url;
    } else {
      var temp_str = url.split("?");
      var value = temp_str[0];
    }
    if ((value || null) == null)
    {
      return false;
    }

    var temp_tabbar_pages = this.data.tabbar_pages;
    for (var i in temp_tabbar_pages)
    {
      if (temp_tabbar_pages[i] == value)
      {
        return true;
      }
    }
    return false;
  },

  /**
   * 事件操作
   */
  operation_event(e) {
      var value = e.target.dataset.value || null;
      var type = parseInt(e.target.dataset.type);

      if (value != null) {
        switch(type) {
          // web
          case 0 :
            my.navigateTo({url: '/pages/web-view/web-view?url='+encodeURIComponent(value)});
            break;

          // 内部页面
          case 1 :
            if (this.is_tabbar_pages(value))
            {
              my.switchTab({ url: value });
            } else {
              my.navigateTo({ url: value });
            }
            break;

          // 跳转到外部小程序
          case 2 :
            my.navigateToMiniProgram({appId: value});
            break;

          // 跳转到地图查看位置
          case 3 :
            var values = value.split('|');
            if (values.length != 4) {
              this.showToast('事件值格式有误');
              return false;
            }

            my.openLocation({
              name: values[0],
              address: values[1],
              longitude: values[2],
              latitude: values[3],
            });
            break;

          // 拨打电话
          case 4 :
            my.makePhoneCall({ number: value });
            break;
        }
      }
    },

  /**
   * 是否需要绑定手机号码
   */
  user_is_need_login(user) {
    // 是否需要绑定手机号码
    if ((user.is_mandatory_bind_mobile || 0) == 1)
    {
      if ((user.mobile || null) == null)
      {
        return true;
      }
    }
    return false;
  },

  /**
   * 默认弱提示方法
   * msg    [string]  提示信息
   * status [string]  状态 默认error [正确success, 错误error]
   */
  showToast(msg, status)
  {
    if ((status || 'error') == 'success')
    {
      my.showToast({
        type: "success",
        content: msg
      });
    } else {
      my.showToast({
        type: "fail",
        content: msg
      });
    }
  },

  // 拨打电话
  call_tel(value) {
    if ((value || null) != null) {
      my.makePhoneCall({ number: value });
    }
  },

  /**
   * 登录校验
   * object     回调操作对象
   * method     回调操作对象的函数
   */
  is_login_check(res, object, method) {
    if(res.code == -400)
    {
      my.clearStorage();
      this.get_user_info(object, method);
      return false;
    }
    return true;
  },

  // 获取用户openid
  get_user_openid() {
    var user = this.get_user_cache_info();
    return (user == false) ? null : user.alipay_openid || null;
  },

  /**
   * 设置导航reddot
   * index     tabBar 的哪一项，从左边算起（0开始）
   * type      0 移出, 1 添加 （默认 0 移出）
   */
  set_tab_bar_reddot(index, type) {
    if (index !== undefined && index !== null)
    {
      if ((type || 0) == 0)
      {
        my.hideTabBarRedDot({ index: Number(index) });
      } else {
        my.showTabBarRedDot({ index: Number(index) });
      }
    }
  },

  /**
   * 设置导航车badge
   * index     tabBar 的哪一项，从左边算起（0开始）
   * type      0 移出, 1 添加 （默认 0 移出）
   * value     显示的文本，超过 4 个字符则显示成 ...（type参数为1的情况下有效）
   */
  set_tab_bar_badge(index, type, value) {
    if (index !== undefined && index !== null)
    {
      if ((type || 0) == 0) {
        my.removeTabBarBadge({ index: Number(index) });
      } else {
        my.setTabBarBadge({ index: Number(index), "text": value.toString() });
      }
    }
  },

  // 窗口背景色设置
  set_nav_bg_color_main(color) {
    // 默认主色
    if((color || null) == null)
    {
      color = '#d2364c';
    }

    // 窗口和下拉顶部背景色
    my.setBackgroundColor({
      backgroundColorTop: color,
      backgroundColorBottom: '#f5f5f5',
    });

    // 下拉文字颜色
    my.setBackgroundTextStyle({
      textStyle: 'light',
    });
  },

});
