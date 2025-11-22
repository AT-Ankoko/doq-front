<template>

</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, onUnmounted, ref, watch, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['hide-top-appbar']);
const router = useRouter();
const route = useRoute();

// ----- 상태 변수 (State & Refs) ----- //

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('hide-top-appbar');
});

onUnmounted(() => {

});

// ----- 함수 정의 (Methods) ----- //
</script> 

<style scoped>

</style>