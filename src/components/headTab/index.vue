<script>
    module.exports = {
        props: ['homeData']
    }
</script>

<template>
    <div class="head-tab">
        <h1>
            {{ homeData.title }}
        </h1>
    </div>
</template>

<style src="./style.scss" lang="scss"></style>
