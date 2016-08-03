# vue-webpack-template
    -- 移动端 中小型 单页面应用 模板
    -- 基于vue-cli(vue 推荐脚手架 vue-webpack模板)
    -- 使用 vue vue-router vue-resource webpack flexible sass postCss ES6 等


## Build Setup

``` bash
# install dependencies  首次使用,请运行 此命令安装node.js依赖
npm install

# serve with hot reload at localhost:8888  开发 请运行此命令进行调试
npm run dev

# build for production with minification   发布 请运行此命令(master分支下), 然后把所有变动的文件统一上传到git
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


# vue + webpack 的各种坑

```
"vue-resource": "0.9" 以后的版本 get请求无法直接 使用{foo: bar} 传递参数, 返回结果也无法自动编译为json 需要使用 resp.json() 建议所有ajax使用 post请求

简单使用全局数据的方法, 在router外层加一层 vue (即app.vue), 需要放在全局的数据可以放在app.vue下

更复杂的数据和状态管理, 请使用 vux (https://github.com/vuejs/vuex)

webpack 打包sass 的时候 引用的共有部分无法自动去除, 会被重复打包进来 所以, common.scss 文件中只能放 公用的 变量 方法 和 mixin 等
```

# 其他说明

```
设置 代理跳转的地方 : ./config/index.js  proxyTable

使用postcss的 1 autoprefixer插件, 添加浏览器兼容的css前缀  设置规则参考地址: (官方)https://github.com/postcss/autoprefixer (中文)http://www.ydcss.com/archives/94

使用postcss的 2 cssnano插件, 简化和压缩css (discardUnused等四个选项是不安全选项,所以关闭,如果css出现未知错误,请关闭此插件!! http://cssnano.co/optimisations/)

使用postcss的 3 后期可以考虑使用 pxtorem 插件来进行 px => rem 的转换 不再使用用sass的 mixin

```

# 目录结构

    ├── build/                      # webpack config files
    │   └── ...
    ├── config/
    │   ├── index.js                # main project config
    │   └── ...
    ├── src/
    │   ├── main.js                 # app entry file
    │   ├── App.vue                 # main app component
    │   ├── components/             # ui components
    │   │   └── ...                 # main app component
    │   ├── views/                  # vue-router component
    │   │   └── ...
    │   └── assets/                 # module assets (processed by webpack)
    │       └── ...
    ├── static/                     # pure static assets (directly copied)
    ├── test/
    │   └── unit/                   # unit tests
    │   │   ├── specs/              # test spec files
    │   │   ├── index.js            # test build entry file
    │   │   └── karma.conf.js       # test runner config file
    │   └── e2e/                    # e2e tests
    │   │   ├── specs/              # test spec files
    │   │   ├── custom-assertions/  # custom assertions for e2e tests
    │   │   ├── runner.js           # test runner script
    │   │   └── nightwatch.conf.js  # test runner config file
    ├── .babelrc                    # babel config
    ├── .editorconfig.js            # editor config
    ├── .eslintrc.js                # eslint config
    ├── index.html                  # index.html template
    └── package.json                # build scripts and dependencies
