<script>
    module.exports = {
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
                console.log(param);
//                this.showLoading = true;
//                this.$http.post('/api/someApi', {param: param}).then(function (resp) {
//                    let data = resp.json();
//                    if (data.status == 0) {
//                        this.$set('homeData', data.homeData);
//                    } else {
//                        alert("获取信息失败,请稍后重试 " + data.errorMsg);
//                    }
//                    this.showLoading = false
//                }, function (resp) {
//                    alert("网络链接有问题,请稍后重试");
//                });
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

        <p class="message">{{ message }}</p>
        <p class="message">{{ count2 }}</p>

        <input class="msg-input" v-model="message">

        <button class="btn" v-on:click="reverseMessage()">Reverse Message</button>

        <button class="btn" v-on:click="isAlertShow=!isAlertShow">弹出浮层</button>

        <button class="btn" v-on:click="goMenu">to menu</button>

        <a v-link="{ path: '/menu' }">Go to Menu</a>

        <alert-bg v-show="isAlertShow" transition="expand">
            <span>这里的内容会被插入到 alert-bg 组件内部</span>
        </alert-bg>
    </div>
</template>

<style src="./style.scss" lang="scss"></style>

