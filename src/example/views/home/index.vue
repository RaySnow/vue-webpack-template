<script>
    var API = require('../../config/api');
    module.exports = {
        props: ['baseData'],
        data: function () {
            return {
                massage: "这是内容",
                count1: 1,
                isAlertShow: false,
                homeData: {
                    title: "这是一个标题"
                }
            }
        },
        created: function () {
            console.log("created")
        },
        ready: function () {
            console.log("ready")
        },
        destroyed: function () {
            console.log("destroyed")
        },
        methods: {
            getIndex: function (e, param) {
                console.log(API);
                console.log(API.QUERY_API);
                this.$http.post(API.QUERY_API, {param: param}).then(function (resp) {
                    let data = resp.json();
                    if (data.status == 0) {
                        this.$set('homeData', data.homeData);
                    } else {
                        console.log("获取信息失败,请稍后重试 " + data.errorMsg);
                    }
                }, function (resp) {
                    console.log("网络链接有问题,请稍后重试");
                });
            },
            reverseMessage: function () {
                this.message = this.message.split('').reverse().join('')
            },
            goMenu: function () {
                this.$state.go("menu")
            }
        },
        components: {
            'head-tab': require('../../components/headTab/index.vue'),
            'alert-bg': require('../../components/alertBg/index.vue')
        },
        route: {
//          vue-router 推荐 当页面切换时 在route函数中处理数据请求
            data(transition){
                this.getIndex("param");
            }
        }
    }
</script>

<template>
    <div id="home" class="wrapper">
        <head-tab :home-data="homeData"></head-tab>

        <h1>{{ baseData.msg }}</h1>
        <div class="image"></div>
        <div class="image-small"></div>
        <div class="image-static"></div>

        <p class="message">{{ message }}</p>
        <p class="message">{{ count2 }}</p>

        <input class="msg-input" v-model="message">

        <button class="btn" @click="reverseMessage()">Reverse Message</button>

        <button class="btn" @click="isAlertShow=!isAlertShow">弹出浮层</button>

        <a v-link="{ path: '/menu' }">Go to Menu</a>

        <alert-bg v-show="isAlertShow" transition="expand">
            <span>这里的内容会被插入到 alert-bg 组件内部</span>
        </alert-bg>
    </div>
</template>

<style src="./style.scss" lang="scss"></style>

