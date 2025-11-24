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
            상대 정보 입력하기 +
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
import { ref, reactive, computed, onMounted, defineEmits } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const route = useRoute();
const router = useRouter();

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

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  currentRole.value = route.query.role || 'performer';
  emit('set-side-nav', false);
  emit('set-top-nav', true);
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
  console.log('입력된 데이터:', formData);
  // TODO: 여기서 입력한 데이터를 저장소(Pinia 등)에 저장해야 AI에게 전달 가능
  
  router.push({ 
    path: '/contract-type-select',
    query: { role: currentRole.value } 
  });
};

const complete = () => {
  const payload = {
    ...formData,
    contact: formData.contact.replace(/-/g, ''),
    businessNumber: formData.businessNumber.replace(/-/g, ''),
  };
  console.log('Form submitted:', payload);
  
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