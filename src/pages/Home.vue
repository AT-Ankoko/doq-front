<template>
  <v-container fluid class="home-page fill-height">
    <v-row no-gutters class="align-start pt-15 mt-10">
      
      <v-col cols="12" md="6" class="d-flex flex-column justify-center text-center text-md-left px-md-16 px-8">
        <p class="text-h5 mb-8 font-weight-medium" style="color: #174DC9;">
          3분만에 만드는 완벽한 계약서
        </p>
        
        <h1 class="text-h1 font-weight-bold mb-15 text-black" style="line-height: 1.2;">
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

        <div class="mt-16 w-100" style="max-width: 1000px;">
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
        </div>
      </v-col>

      <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-start">
        <v-img 
          src="@/assets/note_icon.png" 
          contain 
          max-height="50vh" 
          class="floating-image"
          style="transform: translateX(70px);"
        ></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter();
    const clickNavBtn = (path) => {
      router.push(path);
    };

    return {
      clickNavBtn,
    };
  },
};
</script>
<style scoped>  </style>