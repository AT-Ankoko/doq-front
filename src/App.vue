<template>
  <v-app>

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
          density="comfortable" variant="tonal" color="#92A8FE"
          icon="mdi-magnify"
        ></v-btn>
        
        <v-spacer></v-spacer>

        <v-btn
          density="comfortable" variant="tonal" color="#92A8FE"
          icon="mdi-cog-outline"
        ></v-btn>
        
        <v-btn
          class="mt-6 | mb-6"
          density="comfortable" variant="tonal" color="#92A8FE"
          icon="mdi-account-circle-outline"
        ></v-btn>
      </div>
    </v-navigation-drawer>

    <v-app-bar 
      v-if="showTopNav"
      flat
    >
      <v-img
        class="ml-4"
        src="@/assets/main-logo-text.svg"
        max-height="24"
        max-width="48"
        contain
        @click="clickNavBtn('/home')" 
        style="cursor: pointer;"
      ></v-img>

      <v-spacer></v-spacer>

      <v-btn 
        class="mr-2 | nav-text-btn" 
        variant="text"
        append-icon="mdi-chevron-down"
        @click="clickNavBtn('/about')"
        disabled
      >
        About
      </v-btn>
      <v-btn 
        class="mr-2 | nav-text-btn" 
        variant="text"
        append-icon="mdi-chevron-down"
        @click="clickNavBtn('/team')"
        disabled
      >
        Team
      </v-btn>
      <v-btn 
        class="mr-2 | nav-text-btn" 
        variant="text"
        append-icon="mdi-chevron-down"
        @click="clickNavBtn('/howtouse')"
        disabled
      >
        How to Use
      </v-btn>
      <v-btn 
        class="mr-2 | nav-text-btn" 
        variant="text"
        append-icon="mdi-chevron-down"
        @click="clickNavBtn('/archive')"
      >
        Archive
      </v-btn>
    </v-app-bar>

    <v-main>
      <RouterView 
        @set-side-nav="setSideNav"
        @set-top-nav="setTopNav"
      />
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
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// ----- 상태 변수 (State & Refs) ----- //
const showSideNav = ref(true);
const showTopNav = ref(true);
const dialog = ref({
  title: '',
  text: '',
  dialogActive: false, 
  okButton: () => {}
});

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {

});

onUnmounted(() => {

});

// ----- 함수 정의 (Methods) ----- //
const clickNavBtn = (path) => {
  router.push(path);
}

const setSideNav = (value) => {
  showSideNav.value = value;
}

const setTopNav = (value) => {
  showTopNav.value = value;
}
</script>

<style scoped>

:deep(.nav-text-btn .v-btn__content) {
  font-family: "Actor";
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  text-transform: none
}

</style>