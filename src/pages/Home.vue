<template>
home
</template>

<script setup>
// ----- 선언부 ----- //
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['hide-top-appbar']);


// ----- 라이프 사이클 ----- //
onMounted(() => {
  // emit('hide-top-appbar');
});

onUnmounted(() => {

});

// ----- 함수 정의 ----- //


</script> 

<style scoped>

</style>