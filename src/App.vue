<template>
  <v-app class="background">


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
import { onMounted, onUnmounted, ref, computed, watch} from "vue";
import { RouterView } from "vue-router"


const sAppBar = ref(true) // 또는 false

const dialog = ref({
  title: '',
  text: '',
  isActive: false,
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
