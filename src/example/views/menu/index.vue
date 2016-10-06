<script>
    module.exports = {
        data: function () {
            return {
                list: [
                    "list item",
                    "list item",
                    "list item",
                    "list item"
                ]
            }
        },
        methods: {
            addItem: function () {
                this.list.push("new item");
            }
        },
        components: {
            'head-tab': require('../../components/headTab/index.vue')
        },
        route: {
//          vue-router 推荐 当页面切换时 在route函数中处理数据请求
            data(transition){
                console.log("param");
            }
        }
    }
</script>

<template>
    <div id="home" class="wrapper">
        <ul>
            <li v-for="item in list" track-by="$index">
                {{ item }}
            </li>
        </ul>

        <button class="btn" v-on:click="addItem">add item</button>
    </div>
</template>

<style src="./style.scss" lang="scss"></style>

