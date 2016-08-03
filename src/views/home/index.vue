<script>
    module.exports = {
        data: function () {
            return {
                title: "这是首页",
                masterId: "",
                showLoading: false,
                homeData: false
            }
        },
        methods: {
            getIndex: function (param) {
                this.showLoading = true
                this.$http.post('/api/someApi', {param: param}).then(function (resp) {
                    let data = resp.json()
                    if (data.status == 0) {
                        this.$set('homeData', data.homeData);
                    } else {
                        alert("获取信息失败,请稍后重试 " + data.errorMsg);
                    }
                    this.showLoading = false
                }, function (resp) {
                    alert("网络链接有问题,请稍后重试");
                });
            }
        },
        components: {
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
        <div>这里是内容</div>
        <alert-bg transition="expand">
            <span>这里的内容会被插入到 alert-bg 组件内部</span>
        </alert-bg>
    </div>
</template>

<style src="./style.scss" lang="scss"></style>

