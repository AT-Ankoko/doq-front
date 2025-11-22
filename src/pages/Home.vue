<template>
  <v-container fluid class="home-page fill-height">
    <v-row no-gutters class="align-start pt-15 mt-10">
      
      <v-col cols="12" md="6" class="d-flex flex-column justify-center text-center text-md-left px-md-16 px-8">
        <p class="text-h5 mb-6 font-weight-medium" style="color: #174DC9;">
          3분만에 만드는 완벽한 계약서
        </p>
        
        <h1 
        class="text-h1 font-weight-bold mb-15 text-black" 
        style="line-height: 1.2; word-break: keep-all;"
        >
          계약서 작성,<br>지금 시작해볼까요?
        </h1>

        <div class="d-flex ga-4 justify-center mb-8 justify-md-start">
          <v-btn
            color="#174DC9"
            variant="flat"
            rounded="xl"
            size="x-large"
            class="px-8 font-weight-bold text-white custom-height-btn"
            @click="clickNavBtn('/contract-input1')" 
          >
            Get started
            <v-icon right class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
          
          <v-btn
            color="black"
            variant="outlined"
            rounded="xl"
            size="x-large"
            class="px-8 font-weight-bold custom-height-btn"
            @click="clickNavBtn('/howtouse')"
          >
            How to use
          </v-btn>
        </div>

        <section class="mt-16 w-100" style="max-width: 1000px;">
           <p class="text-h6 font-weight-bold mb-8 text-black">
             계약서 작성, 4단계면 충분해요!
           </p>
           
           <div class="stepper-container">
              <div class="stepper-line">
                <div class="stepper-progress"></div>
              </div>

              <div class="stepper-icons">
                <div class="step-wrapper">
                  <div class="step"></div>
                  <span class="step-label">역할 선택</span>
                </div>
                
                <div class="step-wrapper">
                  <div class="step"></div>
                  <span class="step-label">정보입력</span>
                </div>

                <div class="step-wrapper">
                  <div class="step"></div>
                  <span class="step-label">조건설정</span>
                </div>

                <div class="step-wrapper">
                  <div class="step"></div>
                  <span class="step-label">서명</span>
                </div>
              </div>
           </div>
        </section>
      </v-col>

      <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-start">
        <v-img 
          src="@/assets/note_icon.png" 
          contain 
          max-height="45vh" 
          class="floating-image"
          style="transform: translateX(70px);"
        ></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['hide-side-appbar']);
const router = useRouter();

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('hide-side-appbar');
});

// ----- 함수 정의 (Methods) ----- //
const clickNavBtn = (path) => {
  router.push(path);
};
</script>

<style scoped>
.custom-height-btn {
  min-height: 60px !important;
  padding-top: 15px !important;
  padding-bottom: 15px !important;
}

.v-chip {
    height: auto !important;
}

.v-btn {
  letter-spacing: normal !important;
  font-size: 1rem !important;
}

.text-h2 {
  line-height: 1.3 !important;
}

.stepper-spacing {
  margin-top: 6rem;
}

@media (max-width: 960px) {
  .text-h2 {
    font-size: 2.5rem !important;
  }
  .text-h6 {
    font-size: 1rem !important;
  }
}

@media (max-width: 1700px) {
  .text-h1 {
    font-size: 5rem !important; /* 기존 6rem에서 축소 */
    line-height: 1.2 !important;
  }
}
/* --- Animated Stepper Styles --- */
.stepper-container {
  width: 100%;
  position: relative;
  /* margin 등은 상위 태그에서 제어하므로 제거하거나 조정 */
}

/* 회색 배경 라인 */
.stepper-line {
  width: 100%;
  height: 6px; /* 두께 살짝 얇게 조정 */
  background: #E0E0E0;
  border-radius: 10px;
  position: absolute;
  top: 15px; /* 동그라미(24px)의 중간인 12px 근처로 위치 조정 */
  left: 0;
  overflow: hidden;
  z-index: 0;
}

/* 파란색 차오르는 라인 */
.stepper-progress {
  position: absolute;
  height: 100%;
  width: 0%;
  background: #174DC9; /* DoQ 메인 컬러 */
  border-radius: 10px;
  animation: fillBar 6.5s ease-in-out infinite;
}

.stepper-icons {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1; /* 라인 위에 오도록 설정 */
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px; /* 텍스트 줄바꿈 방지 및 정렬을 위한 폭 */
}

/* 동그라미 스텝 */
.step {
  width: 36px;
  height: 36px;
  background: #E0E0E0;
  border-radius: 50%;
  border: 5px solid #f8f9fa; /* 배경색과 같은 테두리를 줘서 라인과 분리된 느낌 */
  position: relative;
  transition: background 0.3s;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 체크마크 (v 표시) */
.step::after {
  content: '✓';
  font-size: 30px;
  color: rgb(255, 255, 255);
  position: absolute;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 텍스트 라벨 */
.step-label {
  font-size: 1.275rem;
  font-weight: 600;
  color: #757575;
  white-space: nowrap;
  transition: color 0.3s;
}

/* --- Animations --- */

/* 진행 바 애니메이션 */
@keyframes fillBar {
  0% { width: 0%; }
  92% { width: 100%; }
  100% { width: 0%; }
}

/* 각 스텝별 활성화 애니메이션 (색상 및 체크마크) */
.step-wrapper:nth-child(1) .step { animation: stepActive1 6.5s infinite; }
.step-wrapper:nth-child(1) .step::after { animation: checkmarkActive1 6.5s infinite; }

.step-wrapper:nth-child(2) .step { animation: stepActive2 6.5s infinite; }
.step-wrapper:nth-child(2) .step::after { animation: checkmarkActive2 6.5s infinite; }

.step-wrapper:nth-child(3) .step { animation: stepActive3 6.5s infinite; }
.step-wrapper:nth-child(3) .step::after { animation: checkmarkActive3 6.5s infinite; }

.step-wrapper:nth-child(4) .step { animation: stepActive4 6.5s infinite; }
.step-wrapper:nth-child(4) .step::after { animation: checkmarkActive4 6.5s infinite; }

/* 텍스트 색상도 같이 변경되도록 애니메이션 추가 */
.step-wrapper:nth-child(1) .step-label { animation: textActive1 6.5s infinite; }
.step-wrapper:nth-child(2) .step-label { animation: textActive2 6.5s infinite; }
.step-wrapper:nth-child(3) .step-label { animation: textActive3 6.5s infinite; }
.step-wrapper:nth-child(4) .step-label { animation: textActive4 6.5s infinite; }


/* Keyframes 정의 (DoQ 블루: #174DC9) */

/* Step 1 */
@keyframes stepActive1 {
  0% { background: #174DC9; }
  92% { background: #174DC9; }
  100% { background: #E0E0E0; }
}
@keyframes checkmarkActive1 {
  0% { opacity: 1; transform: scale(1); }
  92% { opacity: 1; transform: scale(1); }
  92.01% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 0; transform: scale(0.5); }
}
@keyframes textActive1 {
  0% { color: #174DC9; }
  92% { color: #174DC9; }
  100% { color: #757575; }
}

/* Step 2 */
@keyframes stepActive2 {
  0% { background: #E0E0E0; }
  33% { background: #174DC9; }
  92% { background: #174DC9; }
  100% { background: #E0E0E0; }
}
@keyframes checkmarkActive2 {
  0% { opacity: 0; transform: scale(0.5); }
  33% { opacity: 1; transform: scale(1); }
  92% { opacity: 1; transform: scale(1); }
  92.01% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 0; transform: scale(0.5); }
}
@keyframes textActive2 {
  0% { color: #757575; }
  33% { color: #174DC9; }
  92% { color: #174DC9; }
  100% { color: #757575; }
}

/* Step 3 */
@keyframes stepActive3 {
  0% { background: #E0E0E0; }
  66% { background: #174DC9; }
  92% { background: #174DC9; }
  100% { background: #E0E0E0; }
}
@keyframes checkmarkActive3 {
  0% { opacity: 0; transform: scale(0.5); }
  66% { opacity: 1; transform: scale(1); }
  92% { opacity: 1; transform: scale(1); }
  92.01% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 0; transform: scale(0.5); }
}
@keyframes textActive3 {
  0% { color: #757575; }
  66% { color: #174DC9; }
  92% { color: #174DC9; }
  100% { color: #757575; }
}

/* Step 4 */
@keyframes stepActive4 {
  0% { background: #E0E0E0; }
  92% { background: #174DC9; }
  100% { background: #E0E0E0; }
}
@keyframes checkmarkActive4 {
  0% { opacity: 0; transform: scale(0.5); }
  92% { opacity: 1; transform: scale(1); } 
}
@keyframes textActive4 {
  0% { color: #757575; }
  92% { color: #174DC9; }
  100% { color: #757575; }
}
/* Note Icon Floating Animation */
@keyframes float {
  0% { transform: translate(70px, 0px); } /* 기존 translateX 유지하면서 위아래로 움직임 */
  50% { transform: translate(70px, -10px); } /* 위로 15px 이동 */
  100% { transform: translate(70px, 0px); } /* 다시 시작 위치로 돌아옴 */
}

/* note_icon 이미지를 위한 스타일 */
.floating-image {
  animation: float 3s ease-in-out infinite; /* 3초 동안 부드럽게 무한 반복 */
}
</style>