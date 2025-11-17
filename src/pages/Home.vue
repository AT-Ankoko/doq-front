<template>
  <v-container fluid class="home-page | fill-height | pa-0">
    <div class="background-elements">
      <img src="@/assets/hand-with-pen.png" alt="Hand with pen" class="main-illustration" />
      <div class="circle | circle-large | circle-1"></div>
      <div class="circle | circle-medium | circle-2"></div>
      <div class="circle | circle-small | circle-3"></div>
      <div class="circle | circle-medium | circle-4"></div>
    </div>

    <v-row no-gutters class="fill-height | align-center">
      <v-col cols="12" class="d-flex | flex-column | justify-center | pa-10 | text-area">
        <div class="doq-logo | mb-6">
          <v-img src="@/assets/main-logo.svg" max-height="40" max-width="120" contain></v-img>
        </div>
        <h1 class="text-h2 | font-weight-bold | mb-4 | text-white">
          계약서 작성,<br>지금 시작해볼까요?
        </h1>
        <p class="text-h6 | mb-8 | text-white | text-opacity-75">
          DoQ와 함께 몇 분 만에 공정하고 깔끔한 계약서를 만들어보세요.
        </p>
        <div class="d-flex | ga-4 | button-group">
          <v-btn
            color="white"
            variant="flat"
            rounded="xl"
            size="large"
            class="pl-6 | pr-4"
            @click="clickNavBtn('/contract-input1')" 
          >
            Get Started
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn
            color="white"
            variant="outlined"
            rounded="xl"
            size="large"
            class="px-6"
            @click="clickNavBtn('/howtouse')"
          >
            How to use
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="5" class="d-flex | justify-end | align-center | pr-10 | stage-indicator-area">
        <div class="stage-indicator">
          <div class="stage-item | active">
            <div class="dot"></div>
            <div class="line"></div>
            <span class="text-white">역할 선택</span>
          </div>
          <div class="stage-item">
            <div class="dot"></div>
            <div class="line"></div>
            <span class="text-white">정보 입력</span>
          </div>
          <div class="stage-item">
            <div class="dot"></div>
            <div class="line"></div>
            <span class="text-white">조건 설정</span>
          </div>
          <div class="stage-item">
            <div class="dot"></div>
            <div class="line"></div>
            <span class="text-white">확인 및 서명</span>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['hide-side-appbar']);
const router = useRouter(); 


onMounted(() => {
  emit('hide-side-appbar');
});

onUnmounted(() => {

});

function clickNavBtn(path) {
  router.push(path);
}

</script> 

<style scoped>
.home-page {
  position: relative;
  overflow: hidden;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-illustration {
  position: absolute;
  width: 60%;
  max-width: 800px;
  height: auto;
  bottom: 0%;
  right: -5%;
  transform: translateX(-40%);
}

.circle {
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
  opacity: 0.08;
  filter: blur(50px);
  pointer-events: none;
}

.circle-large {
  width: 400px;
  height: 400px;
}

.circle-medium {
  width: 250px;
  height: 250px;
}

.circle-small {
  width: 150px;
  height: 150px;
}

.circle-1 {
  top: 10%;
  left: 20%;
}

.circle-2 {
  bottom: 15%;
  left: 10%;
}

.circle-3 {
  top: 5%;
  right: 25%;
}

.circle-4 {
  bottom: 30%;
  right: 15%;
}

.text-area {
  z-index: 1;
  max-width: 800px;
  @media (min-width: 960px) {
    padding-left: 100px !important;
  }
}

.stage-indicator-area {
  z-index: 1;
}

.stage-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  position: relative;
}

.stage-indicator .stage-item {
  display: flex;
  align-items: center;
  position: relative;
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
}

.stage-indicator .stage-item.active {
  color: #FFFFFF;
}

.stage-indicator .stage-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  margin-right: 15px;
  transition: background-color 0.3s ease;
  z-index: 2;
}

.stage-indicator .stage-item.active .dot {
  background-color: #FFFFFF;
}

.stage-indicator .stage-item .line {
  position: absolute;
  left: 5.5px;
  top: 100%;
  height: 20px;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  z-index: 1;
}

.stage-indicator .stage-item:last-child .line {
  display: none;
}

@media (max-width: 959px) {
  .stage-indicator-area {
    display: none !important;
  }
  .main-illustration {
    width: 80%;
    right: -20%;
    bottom: 0%;
  }
  .text-area {
    text-align: center;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .doq-logo {
    display: none;
  }
  .button-group {
    justify-content: center;
  }
}
</style>