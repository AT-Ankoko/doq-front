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

    <!-- 세션 연결 다이얼로그 -->
    <v-dialog v-model="showSessionDialog" persistent width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon class="mr-2" color="primary">mdi-connection</v-icon>
          계약 채팅 시작하기
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-2 text-grey-darken-2 mb-4">
            새로운 계약 세션을 시작하거나, 파트너가 공유한 세션 ID를 입력하여 참여할 수 있습니다.
          </p>

          <div class="d-flex flex-column gap-3">
            <!-- 새 세션 생성 -->
            <div>
              <v-btn
                block
                color="primary"
                variant="flat"
                size="large"
                @click="createSessionAndGo"
                :loading="isLoading"
              >
                <v-icon start>mdi-plus-circle</v-icon>
                새로운 계약 시작 (방장)
              </v-btn>
              <p class="text-caption text-grey mt-2 mb-0">새로운 채팅방을 만들고 파트너를 초대합니다.</p>
            </div>

            <!-- 구분선 -->
            <div class="d-flex align-center gap-2 my-2">
              <v-divider></v-divider>
              <span class="text-caption text-grey-darken-1">또는</span>
              <v-divider></v-divider>
            </div>

            <!-- 기존 세션 참여 -->
            <div>
              <p class="text-caption text-grey font-weight-bold mb-2">세션 ID</p>
              <v-text-field
                v-model="targetSid"
                placeholder="공유받은 세션 ID 입력"
                variant="outlined"
                density="compact"
                @keyup.enter="joinSessionAndGo"
              ></v-text-field>
              <v-btn
                block
                color="success"
                variant="flat"
                size="large"
                @click="joinSessionAndGo"
                :loading="isLoading"
                :disabled="!targetSid.trim()"
              >
                <v-icon start>mdi-login</v-icon>
                기존 계약 참여 (참여자)
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showSessionDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { reactive, ref, onMounted, defineEmits } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStorageWithExpiry } from '@/common/useStorageWithExpiry';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();
const route = useRoute();
const { setItem, getItem } = useStorageWithExpiry();

const currentRole = route.query.role || 'client';
const API_BASE_URL = 'https://doq-server.onrender.com';

const showSessionDialog = ref(false);
const isLoading = ref(false);
const targetSid = ref('');
const selectedType = ref(null);

const projectTypes = reactive([
  { id: 'design', title: 'Design', desc: '로고 / 브랜딩 / 인쇄 / UI·UX / 광고', icon: 'src/assets/Design-icon.svg', disabled: false },
  { id: 'software', title: 'Software', desc: '서버·클라우드 / IT·프로그래밍 / 앱', icon: 'src/assets/Software-icon.svg', disabled: true },
  { id: 'video', title: 'Video', desc: '광고·홍보 / 제품 / 행사 / 미디어', icon: 'src/assets/Video-icon.svg', disabled: true }
]);

onMounted(() => {
  emit('set-top-nav', true);
  emit('set-side-nav', false);
});

// contractData를 session_info 구조로 변환
function formatBusinessNumber(num) {
  // 사업자번호: 10자리 → 123-45-67890
  const digits = num.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 10)
    return `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;
  return num;
}

function formatPhoneNumber(num) {
  // 연락처: 01012345678 → 010-1234-5678, 0212345678 → 02-1234-5678
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('02')) {
    if (digits.length === 10)
      return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6)}`;
    if (digits.length === 9)
      return `${digits.slice(0,2)}-${digits.slice(2,5)}-${digits.slice(5)}`;
  } else {
    if (digits.length === 11)
      return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
    if (digits.length === 10)
      return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return num;
}

function contractDataToSessionInfo(contractData, userId) {
  const client = contractData.client || {};
  const performer = contractData.performer || {};
  return {
    userId: userId || '',
    client_name: client.name || '',
    provider_name: performer.name || '',
    contract_date: client.contractDate || performer.contractDate || '',
    client_business_number: client.businessNumber ? formatBusinessNumber(client.businessNumber) : '',
    client_contact: client.contact ? formatPhoneNumber(client.contact) : '',
    provider_business_number: performer.businessNumber ? formatBusinessNumber(performer.businessNumber) : '',
    provider_contact: performer.contact ? formatPhoneNumber(performer.contact) : '',
  };
}

// 카드 선택 시 다이얼로그 오픈
const selectType = (type) => {
  if (type.disabled) return;
  selectedType.value = type;
  
  const allData = getItem('contractData') || {};
  allData.projectType = type.id;
  setItem('contractData', allData, 300000);
  
  showSessionDialog.value = true;
};

// AI용 메시지 포장
const preparePendingMessage = () => {
  const allData = getItem('contractData') || {};
  const myData = allData[currentRole] || {};
  const roleKr = currentRole === 'client' ? '의뢰인(갑)' : '용역자(을)';
  
  const message = `
[사전 입력 정보]
- 역할: ${roleKr}
- 성함/상호: ${myData.name || '미입력'}
- 연락처: ${myData.contact || '미입력'}
- 사업자번호: ${myData.businessNumber || '미입력'}
- 주소: ${myData.address || '미입력'}
- 희망 프로젝트 유형: ${selectedType.value?.title || '미정'}

위 정보를 바탕으로 계약 논의를 진행하겠습니다.
  `.trim();

  localStorage.setItem('pending_contract_msg', message);
  return myData;
};

// [방장] 세션 생성 후 이동 -> /test/socket-chat
const createSessionAndGo = async () => {
  isLoading.value = true;
  try {
    const myData = preparePendingMessage();
    // contractData를 session_info 구조로 변환
    const contractDataRaw = getItem('contractData') || {};
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const payload = contractDataToSessionInfo(contractDataRaw, userId);

    console.log('[POST] /v1/session/connect payload:', payload);
    const res = await fetch(`${API_BASE_URL}/v1/session/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) throw new Error('세션 생성 실패');
    const data = await res.json();
    
    // [경로 수정 완료]
    router.push({ 
      path: '/test/socket-chat', 
      query: { sid: data.sid, role: currentRole } 
    });
    
  } catch (e) {
    console.error(e);
    alert('오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

// [참여자] 기존 세션 이동 -> /test/socket-chat
const joinSessionAndGo = () => {
  if(!targetSid.value.trim()) return alert("세션 ID를 입력해주세요.");
  preparePendingMessage();
  
  // [경로 수정 완료]
  router.push({ 
    path: '/test/socket-chat', 
    query: { sid: targetSid.value, role: currentRole } 
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
