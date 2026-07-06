<template>
  <v-container fluid class="role-selection-page fill-height bg-color">
    <v-row justify="center" align="center" class="flex-column">
      
      <v-col cols="12" class="text-center mb-10">
        <header>
          <span class="text-h6 font-weight-bold" style="color: #174DC9;">
            STEP_01
          </span>
          <h2 class="text-h3 font-weight-bold mt-4 text-black">
            어떤 역할로 계약을 진행 하시겠어요?
          </h2>
        </header>
      </v-col>

      <v-col cols="12" md="10" lg="8">
        <section>
          <v-row justify="center" class="gap-md-4 mt-6">
            
            <v-col cols="12" sm="5" md="5">
              <article>
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 8 : 2"
                    class="role-card py-16 cursor-pointer d-flex flex-column align-center justify-center"
                    rounded="xl"
                    @click="selectRole('client')"
                    :class="{ 'on-hover': isHovering }"
                  >
                    <div class="icon-bg mb-6">
                      <v-img src="@/assets/Client-icon.svg" width="64" height="64"></v-img>
                    </div>

                    <h3 class="text-h6 font-weight-bold mb-2" style="color: #174DC9;">
                      CLIENT
                    </h3>
                    <p class="text-body-1 text-center font-weight-medium text-grey-darken-1">
                      클라이언트로<br>계약을 진행할게요.
                    </p>
                  </v-card>
                </v-hover>
              </article>
            </v-col>

            <v-col cols="12" sm="5" md="5">
              <article>
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 8 : 2"
                    class="role-card py-16 cursor-pointer d-flex flex-column align-center justify-center"
                    rounded="xl"
                    @click="selectRole('performer')"
                    :class="{ 'on-hover': isHovering }"
                  >
                    <div class="icon-bg mb-6">
                      <v-img src="@/assets/Performer_icon.svg" width="64" height="64"></v-img>
                    </div>

                    <h3 class="text-h6 font-weight-bold mb-2" style="color: #174DC9;">
                      PERFORMER
                    </h3>
                    <p class="text-body-1 text-center font-weight-medium text-grey-darken-1">
                      계약자로<br>계약을 진행할게요.
                    </p>
                  </v-card>
                </v-hover>
              </article>
            </v-col>

          </v-row>
        </section>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
});

// ----- 함수 정의 (Methods) ----- //
const selectRole = (role) => {
  console.log(`Selected Role: ${role}`);
  
  // 다음 단계 페이지로 이동하면서 선택한 역할 정보를 넘겨줍니다.
  // 예: /contract-input-step2 페이지로 이동
  router.push({ 
    path: '/contract-input2', // 실제 다음 단계 라우터 주소로 변경 필요
    query: { role: role }     // ?role=client 형태로 URL에 붙어서 넘어감
  });
};
</script>

<style scoped>
.bg-color {
  background-color: #F2F7FD; /* 연한 하늘색 배경 */
}

.role-card {
  transition: all 0.3s ease-in-out;
  border: 2px solid transparent; /* 호버 시 색상 변경을 위해 미리 선언 */
  background-color: #FFFFFF;
}

.role-card.on-hover {
  transform: translateY(-10px); /* 위로 살짝 뜨는 효과 */
  border-color: #174DC9; /* 테두리 파란색 */
}

.icon-bg {
  /* 아이콘 뒤에 은은한 배경이 필요하다면 */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #EBF2FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 모바일에서 카드 간격 조정 */
 @media (max-width: 600px) {
  .role-card {
    margin-bottom: 20px;
  }
}
</style>
