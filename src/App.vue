<template>
  <v-app class="background">

    <v-navigation-drawer
      v-if="showSideNav"
      rail
      permanent
      color="#FFFFFF"
      class="rounded-e-xl"
    >
      <div class="d-flex | flex-column | align-center | ga-3 | pa-2 | fill-height">
        <v-icon class="mt-6 | mb-12">
          <v-img
            src="@/assets/logo.svg"
            width="30" height="30"
            @click="clickNavBtn('/home')" 
            style="cursor: pointer;"
          ></v-img>
        </v-icon>

        <v-btn
          icon="mdi-magnify"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
        
        <v-spacer></v-spacer>

        <v-btn
          icon="mdi-cog-outline"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
        
        <v-btn
          class="mt-6 | mb-6"
          icon="mdi-account-circle-outline"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
      </div>
    </v-navigation-drawer>

    <v-app-bar 
      v-if="showTopNav"
      flat color="#F4F8FD" class="border-b"
    >
      <v-img
        class="ml-4"
        src="@/assets/main-logo.svg"
        max-height="40"
        max-width="70"
        contain
        @click="clickNavBtn('/home')" 
        style="cursor: pointer;"
      ></v-img>

      <v-spacer></v-spacer>

            <v-btn
              class="mr-2"
              variant="text"
              append-icon="mdi-chevron-down"
              size="large"
              @click="clickNavBtn('/about')"
            >        About
      </v-btn>
            <v-btn
              class="mr-2"
              variant="text"
              append-icon="mdi-chevron-down"
              size="large"
              @click="clickNavBtn('/team')"
            >        Team
      </v-btn>
            <v-btn
              class="mr-2"
              variant="text"
              append-icon="mdi-chevron-down"
              size="large"
              @click="clickNavBtn('/howtouse')"
            >        How to Use
      </v-btn>
            <v-btn
              class="mr-2"
              variant="text"
              append-icon="mdi-chevron-down"
              size="large"
              @click="clickNavBtn('/archive')"
            >        Archive
      </v-btn>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>

  <v-dialog v-model="dialog.dialogActive" width="auto">
    <v-card class="pa-2 | pb-3" rounded="lg">
      <v-card-title class="text-title | pl-4 | pr-4 | pt-4">
        <v-row style="justify-content: start; align-items: center;">
          <v-col class="pt-0 | pb-0 | pl-4 | pr-1" cols="auto">
            <v-img
              src="@/assets/logo.png"
              height="24"
              width="24"
              class=""
            ></v-img>
          </v-col>
          <v-col class="pl-1" cols="auto">
            {{ dialog.title }}
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="text-subtitle | pl-4 | pr-4 | pt-2 | pb-3" v-html="dialog.text"></v-card-text>
      <template v-slot:actions>
          <v-row no-gutters justify="end">
              <v-btn color="#FF5858" width="25%" rounded="xl" variant="outlined" @click="dialog.dialogActive = false">취소</v-btn>
              <v-btn color="#FF5858" width="25%" rounded="xl" variant="flat" class="ml-2" @click="dialog.okButton">확인</v-btn>
          </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
// ----- 선언부 ----- //
import { onMounted, onUnmounted, ref, watch } from "vue"; // (수정) watch 임포트
import { RouterView, useRouter, useRoute } from "vue-router"; // (수정) useRoute 임포트

// 라우터 인스턴스 가져오기
const router = useRouter();
const route = useRoute(); // (추가) 현재 라우트 정보 가져오기

// 네비게이션 및 앱 바 표시 상태
const showSideNav = ref(false);
const showTopNav = ref(true);

// 템플릿의 v-model="dialog.dialogActive"와 일치하도록 'isActive'를 'dialogActive'로 수정
const dialog = ref({
  title: '',
  text: '',
  dialogActive: false, 
  okButton() {}
});


// ----- 라이프 사이클 ----- //
onMounted(() => {

});

onUnmounted(() => {

});

// (추가) 라우트 변경 감지
watch(
  () => route.fullPath,
  (newPath) => {
    // meta 필드를 확인하여 사이드바 표시 여부 결정
    showSideNav.value = !route.meta.hideSidebar && newPath !== '/home' && newPath !== '/';
    showTopNav.value = true;
  },
  { immediate: true } // 컴포넌트 마운트 시 즉시 실행
);


// ----- 함수 정의 ----- //

// (추가) 라우터 이동 함수
function clickNavBtn(path) {
  router.push(path);
}
</script>

<style scoped>

.margin-top-16 {
  margin-top: 16px;
}

.padding-32 {
  padding: 32px;
}

.padding-top-56 {
  padding-top: 56px;
}

.padding-bottom-16 {
  padding-bottom: 16px;
}

</style>