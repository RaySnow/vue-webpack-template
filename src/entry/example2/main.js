var Vue = require("vue");
var vueResource = require("vue-resource");
var VueRouter = require("vue-router");

Vue.use(vueResource);
Vue.use(VueRouter);

var App = require('./App.vue');
var home = require('./../../views/home/index.vue');
var menu = require('./../../views/menu/index.vue');

// 开启debug模式
Vue.config.debug = true;

// 让 vue-resource 使用 content-type urlencode 的格式进行ajax请求
Vue.http.options.emulateJSON = true;

var router = new VueRouter();

// 定义路由规则
router.map({
  '/home':{
    name: 'home',
    component: home
  },
  '/menu':{
    name: 'menu',
    component: menu
  }
});

router.beforeEach(function () {
  window.scrollTo(0, 0)
});

router.redirect({
  '*':"/home"
});

// 路由器会创建一个 App 实例，并且挂载到选择符 #app 匹配的元素上。
router.start(App, '#app');
