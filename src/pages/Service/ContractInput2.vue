<template>
  <v-container fluid class="fill-height bg-color">
    <v-row justify="center" align="center" class="flex-column">
      
      <v-col cols="12" class="text-center mb-12">
        <header>
          <span class="text-h6 font-weight-bold" style="color: #174DC9;">
            STEP_02
          </span>
          <h2 class="text-h3 font-weight-bold mt-4 text-black">
            계약의 기본 정보를 입력해주세요.
          </h2>
        </header>
      </v-col>

      <v-col cols="12" md="8" lg="6">
        <section>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6" class="px-md-4">
                <div class="d-flex align-center input-row">
                  <span class="field-label">성함 <span class="required">*</span></span>
                  <v-text-field
                    v-model="formData.name"
                    placeholder="성함(회사명)을 입력해주세요."
                    variant="underlined"
                    color="#174DC9"
                    hide-details="auto"
                    class="custom-input"
                  ></v-text-field>
                </div>
              </v-col>
              <v-col cols="12" md="6" class="px-md-4">
                <div class="d-flex align-center input-row">
                  <span class="field-label">연락처 <span class="required">*</span></span>
                  <v-text-field
                    v-model="formData.contact"
                    placeholder="연락처를 입력해주세요."
                    variant="underlined"
                    color="#174DC9"
                    hide-details="auto"
                    class="custom-input"
                    @input="formatPhoneNumber"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12" md="6" class="px-md-4">
                <div class="d-flex align-center input-row">
                  <span class="field-label">사업자번호</span>
                  <v-text-field
                    v-model="formData.businessNumber"
                    placeholder="사업자번호를 입력해주세요."
                    variant="underlined"
                    color="#174DC9"
                    hide-details="auto"
                    class="custom-input"
                    @input="formatBusinessNumber"
                  ></v-text-field>
                </div>
              </v-col>
              <v-col cols="12" md="6" class="px-md-4">
                <div class="d-flex align-center input-row">
                  <span class="field-label">계약체결일</span>
                  <v-text-field
                    v-model="formData.contractDate"
                    type="date"
                    placeholder="계약체결일을 입력해주세요."
                    variant="underlined"
                    color="#174DC9"
                    hide-details="auto"
                    class="custom-input"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12" class="px-md-4">
                <div class="d-flex align-center input-row">
                  <span class="field-label" style="min-width: 80px;">주소</span>
                  <v-text-field
                    v-model="formData.address"
                    placeholder="주소를 입력해주세요"
                    variant="underlined"
                    color="#174DC9"
                    hide-details="auto"
                    class="custom-input"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </section>
      </v-col>

      <v-col cols="12" class="text-center mt-12 d-flex justify-center">
        <footer class="d-flex ga-4">
          <v-btn
            color="#174DC9"
            rounded="xl"
            size="x-large"
            class="px-10 py-4 font-weight-bold"
            style="height: 60px; font-size: 1.1rem;"
            @click="goToNextStep"
          >
            <v-icon v-if="isOtherRoleFilled" class="mr-2">mdi-check-circle</v-icon>
            {{ nextRoleLabel }} 정보 입력하기 +
          </v-btn>
          <v-btn
            :disabled="!isFormValid"
            color="primary"
            rounded="xl"
            size="x-large"
            class="px-10 py-4 font-weight-bold"
            style="height: 60px; font-size: 1.1rem;"
            @click="complete"
          >
            작성 완료
          </v-btn>
        </footer>
      </v-col>

      <v-col cols="12" class="text-center mt-8 text-grey-darken-1">
        <p class="text-body-1">
          <strong style="color: #174DC9;">'{{ roleLabel }}'</strong>로 진행 중 입니다.
        </p>
        <p class="text-body-2 mt-1">
          계약 당사자 정보를 입력하면 AI가 계약서 작성을 시작합니다.
        </p>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { ref, reactive, computed, onMounted, defineEmits, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useStorageWithExpiry } from '@/common/useStorageWithExpiry';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const route = useRoute();
const router = useRouter();
const { setItem, getItem } = useStorageWithExpiry();

// ----- 상태 변수 (State & Refs) ----- //
const currentRole = ref(''); 
const formData = reactive({
  name: '',
  contact: '',
  businessNumber: '',
  contractDate: new Date().toISOString().substr(0, 10),
  address: ''
});

// ----- 컴퓨티드 (Computed) ----- //
const isFormValid = computed(() => {
  return formData.name.trim() !== '' && formData.contact.trim() !== '';
});

const roleLabel = computed(() => {
  return currentRole.value === 'client' ? '클라이언트' : '계약자';
});

const nextRoleLabel = computed(() => {
  return currentRole.value === 'client' ? '계약자' : '클라이언트';
});

const isOtherRoleFilled = computed(() => {
  const savedData = getItem('contractData');
  const otherRole = currentRole.value === 'client' ? 'performer' : 'client';
  return savedData && savedData[otherRole] && savedData[otherRole].name;
});

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
const loadDataForRole = (role) => {
  currentRole.value = role || 'performer';
  
  // localStorage에서 전체 데이터 불러오기
  const savedData = getItem('contractData');
  
  // 현재 역할에 해당하는 데이터가 있으면 formData에 채우기
  if (savedData && savedData[currentRole.value]) {
    Object.assign(formData, savedData[currentRole.value]);
  } else {
    // 데이터가 없으면 formData 초기화
    Object.assign(formData, {
      name: '',
      contact: '',
      businessNumber: '',
      contractDate: new Date().toISOString().substr(0, 10),
      address: ''
    });
  }
};

onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
  loadDataForRole(route.query.role);
});

// 역할 전환 시 onMounted가 재실행되지 않으므로 route.query.role을 감시(watch)
watch(() => route.query.role, (newRole) => {
  loadDataForRole(newRole);
});

// ----- 포맷팅 함수 (Formatting Functions) ----- //
const formatPhoneNumber = () => {
  let value = formData.contact.replace(/\D/g, '');
  const len = value.length;
  let result = '';

  if (value.startsWith('02')) {
    value = value.slice(0, 10);
    if (len < 3) {
      result = value;
    } else if (len < 6) {
      result = `${value.slice(0, 2)}-${value.slice(2)}`;
    } else if (len < 10) {
      result = `${value.slice(0, 2)}-${value.slice(2, 5)}-${value.slice(5)}`;
    } else {
      result = `${value.slice(0, 2)}-${value.slice(2, 6)}-${value.slice(6)}`;
    }
  } else {
    value = value.slice(0, 11);
    if (len < 4) {
      result = value;
    } else if (len < 8) {
      result = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      result = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }
  }
  formData.contact = result;
};

const formatBusinessNumber = () => {
  let value = formData.businessNumber.replace(/\D/g, '');
  value = value.slice(0, 10);
  const len = value.length;
  let result = '';
  
  if (len < 4) {
    result = value;
  } else if (len < 6) {
    result = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    result = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
  }
  formData.businessNumber = result;
};

// ----- 함수 정의 (Methods) ----- //
const goToNextStep = () => {
  // 1. 현재 입력한 데이터 저장 (기존 로직 유지)
  const allData = getItem('contractData') || {};
  allData[currentRole.value] = {
    ...formData,
    contact: formData.contact.replace(/-/g, ''),
    businessNumber: formData.businessNumber.replace(/-/g, '')
  };
  setItem('contractData', allData, 300000);
  
  // 2. 역할 전환 (client ↔ performer)
  const nextRole = currentRole.value === 'client' ? 'performer' : 'client';
  
  // 3. 전환된 역할로 현재 페이지 재로드
  router.push({ 
    path: '/contract-input2',  // 같은 페이지
    query: { role: nextRole }
  });
};

const complete = () => {
  // 1. 현재 데이터 저장
  const allData = getItem('contractData') || {};
  allData[currentRole.value] = {
    ...formData,
    contact: formData.contact.replace(/-/g, ''),
    businessNumber: formData.businessNumber.replace(/-/g, '')
  };
  setItem('contractData', allData, 300000);
  
  // 2. 다음 단계로 이동
  console.log('데이터 입력 완료:', allData);
  
  router.push({ 
    path: '/contract-input3',
    query: { role: currentRole.value } 
  });
};
</script>

<style scoped>
.bg-color {
  background-color: #F2F7FD;
}

.input-row {
  width: 100%;
}

.field-label {
  font-size: 1rem;
  font-weight: 700;
  color: #091A43; /* 짙은 남색 */
  width: 100px; /* 라벨 고정 너비 */
  flex-shrink: 0; /* 라벨 줄어들지 않게 */
}

.required {
  color: #174DC9;
  margin-left: 2px;
}

.custom-input :deep(input) {
  font-size: 1rem;
  color: #757575;
}

.custom-input :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 8px;
}

/* 플레이스홀더 색상 조정 */
.custom-input :deep(input::placeholder) {
  color: #BDBDBD !important; 
  opacity: 1;
}

 @media (max-width: 600px) {
  .field-label {
    width: 70px;
    font-size: 0.9rem;
  }
}
</style>