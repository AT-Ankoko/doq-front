<template>
  <v-container fluid class="fill-height bg-color">
    <v-row justify="center" align="center" class="flex-column">
      
      <v-col cols="12" class="text-center mb-12">
        <header>
          <span class="text-h6 font-weight-bold" style="color: #174DC9;">
            STEP_03
          </span>
          <h2 class="text-h3 font-weight-bold mt-4 text-black">
            프로젝트 유형을 선택해주세요.
          </h2>
        </header>
      </v-col>

      <v-col cols="12" md="10" lg="10">
        <section>
          <v-row justify="center" class="gap-4">
            <v-col 
              cols="12" md="4" 
              v-for="type in projectTypes" 
              :key="type.id"
            >
              <article>
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="!type.disabled ? props : {}"
                    :elevation="isHovering && !type.disabled ? 8 : 0"
                    class="project-card position-relative py-10 px-8 d-flex flex-column justify-space-between"
                    rounded="xl"
                    :class="{ 
                      'on-hover': isHovering && !type.disabled, 
                      'disabled-card': type.disabled 
                    }"
                    @click="selectType(type)"
                  >
                    <div>
                      <h3 class="text-h4 font-weight-bold mb-3" style="color: #174DC9;">
                        {{ type.title }}
                      </h3>
                      <p class="text-body-1 font-weight-medium text-grey-darken-1" style="line-height: 1.6;">
                        {{ type.desc }}
                      </p>
                    </div>

                    <div class="position-absolute bottom-0 right-0 mb-6 mr-6">
                      <v-img :src="type.icon" width="100" height="100" />
                    </div>
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
import { reactive, onMounted, defineEmits } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStorageWithExpiry } from '@/common/useStorageWithExpiry';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();
const route = useRoute();
const { setItem, getItem } = useStorageWithExpiry();

// ----- 상태 변수 (State & Refs) ----- //
const currentRole = route.query.role || 'client';
const projectTypes = reactive([
  {
    id: 'design',
    title: 'Design',
    desc: '로고 / 브랜딩 / 인쇄 / UI·UX / 광고',
    icon: 'src/assets/Design-icon.svg',
    disabled: false
  },
  {
    id: 'software',
    title: 'Software',
    desc: '서버·클라우드 / IT·프로그래밍 / 앱',
    icon: 'src/assets/Software-icon.svg',
    disabled: true
  },
  {
    id: 'video',
    title: 'Video',
    desc: '광고·홍보 / 제품 / 행사 / 미디어',
    icon: 'src/assets/Video-icon.svg',
    disabled: true
  }
]);

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('set-top-nav', true);
  emit('set-side-nav', false);
});

// ----- 함수 정의 (Methods) ----- //
const selectType = (type) => {
  if (type.disabled) {
    return;
  }
  
  // 만료 시간이 있는 스토리지에서 전체 계약 데이터 불러오기
  const allData = getItem('contractData') || {};
  // projectType 업데이트
  allData.projectType = type.id;
  // 5분 (300,000ms) TTL로 데이터 다시 저장
  setItem('contractData', allData, 300000);

  console.log(`Saved Project Type: ${type.id}`);
  
  router.push({
    path: '/contract-chat',
    query: { 
      role: currentRole,
      type: type.id 
    }
  });
};
</script>

<style scoped>
.bg-color {
  background-color: #F2F7FD;
}

.project-card {
  transition: all 0.3s ease-in-out;
  border: 2px solid transparent;
  background-color: #FFFFFF;
  min-height: 320px; /* 카드 높이 통일 */
  cursor: pointer;
}

.project-card.on-hover {
  transform: translateY(-8px);
  border-color: #174DC9;
}

/* 비활성화 카드 스타일 */
.disabled-card {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #F5F5F5; /* 약간 회색빛 */
  border: 1px solid #E0E0E0;
}

.disabled-card:hover {
  transform: none;
  border-color: #E0E0E0;
  box-shadow: none !important;
}
</style>
