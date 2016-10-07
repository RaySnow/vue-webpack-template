<template>
    <div class="app">
        <router-view :base-data='baseData'></router-view>
    </div>
</template>
<script>
    module.exports = {
        data: function () {
            return {
                baseData: {
                    msg: "这里用于存放公共数据"
                }
            }
        }
    }
</script>
<style src="./styles/index.scss" lang="scss"></style>
