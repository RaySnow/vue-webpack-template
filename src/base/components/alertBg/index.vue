<template>
    <div class="alert-bg">
        <slot>
        </slot>
    </div>
</template>
<style scoped>
    .alert-bg {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(0, 0, 0, .6);
      z-index: 1000;
    }
</style>
