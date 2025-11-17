<template>
하우투유스
</template>

<script setup>
// ----- 선언부 ----- //
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['hide-side-appbar']);


// ----- 라이프 사이클 ----- //
onMounted(() => {
  emit('hide-side-appbar');
});

onUnmounted(() => {

});

// ----- 함수 정의 ----- //


</script> 

<style scoped>

</style>