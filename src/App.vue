<template>
  <v-app class="background">

    <!-- 좌측 네비게이션 바 (제공해주신 스니펫 기반) -->
    <v-navigation-drawer
      rail
      permanent
      color="#FFFFFF"
      class="rounded-e-xl"
    >
      <!-- 
        v-navigation-drawer 내부에 d-flex flex-column fill-height
        div를 추가하여 v-spacer가 올바르게 작동하도록 합니다.
      -->
      <div class="d-flex | flex-column | align-center | ga-3 | pa-2 | fill-height">
        <!-- 로고 (경로: @/assets/logo.svg - 이 파일이 프로젝트에 존재해야 합니다) -->
        <v-icon class="mt-6 | mb-12">
          <v-img
            src="@/assets/logo.svg"
            width="30" height="30"
          ></v-img>
        </v-icon>

        <!-- 검색 버튼 -->
        <v-btn
          icon="mdi-magnify"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
        
        <v-spacer></v-spacer>

        <!-- 설정 버튼 -->
        <v-btn
          icon="mdi-cog-outline"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
        
        <!-- 계정 버튼 -->
        <v-btn
          class="mt-6 | mb-6"
          icon="mdi-account-circle-outline"
          density="comfortable"
          variant="tonal"
          color="#717171"
        ></v-btn>
      </div>
    </v-navigation-drawer>

    <!-- 상단 앱 바 -->
    <v-app-bar flat color="#E6E8E9" class="border-b">
      <v-app-bar-title>
        <!-- 원하는 앱 타이틀을 여기에 입력하세요 -->
        My Application
      </v-app-bar-title>
    </v-app-bar>

    <!-- 메인 컨텐츠 -->
    <v-main>
      <RouterView />
    </v-main>
  </v-app>

  <!-- 다이얼로그 -->
  <v-dialog v-model="dialog.dialogActive" width="auto">
    <v-card class="pa-2 | pb-3" rounded="lg">
      <v-card-title class="text-title | pl-4 | pr-4 | pt-4">
        <v-row style="justify-content: start; align-items: center;">
          <v-col class="pt-0 | pb-0 | pl-4 | pr-1" cols="auto">
            <!-- 로고 (경로: @/assets/logo.png - 이 파일이 프로젝트에 존재해야 합니다) -->
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
              <v-btn color="#717171" width="25%" rounded="xl" variant="outlined" @click="dialog.dialogActive = false">취소</v-btn>
              <v-btn color="#717171" width="25%" rounded="xl" variant="flat" class="ml-2" @click="dialog.okButton">확인</v-btn>
          </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
// ----- 선언부 ----- //
import { onMounted, onUnmounted, ref, computed, watch} from "vue";
import { RouterView } from "vue-router"


const sAppBar = ref(true) // 또는 false

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

// ----- 함수 정의 ----- //


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