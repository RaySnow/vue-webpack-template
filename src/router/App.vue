<template>
    <div class="app">
        <router-view></router-view>
    </div>
</template>
<script>
    module.exports = {
        data: function () {
            return {
                massage: "这里用于存放公共数据"
            }
        }
    }
</script>
<style src="./css/index.scss" lang="scss"></style>
