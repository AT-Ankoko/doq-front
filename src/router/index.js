import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import { defineAsyncComponent } from "vue";

/* INFO rule
 * path
    1. camelCase 로 작성
    2. 파일 path와 동일하게 작성 예) folder1/folder2/my-file
 * name
    1. 파일명 작성 -> PascalCase 사용.
 * component
    1. 파일 path 작성
 */

const routes = [
  {
    path: '/',
    redirect: '/home' // Redirect root path to dashboard
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ "@/pages/Home.vue"),
    meta: { hideSidebar: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ "@/pages/Info/About.vue")
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import(/* webpackChunkName: "archive" */ "@/pages/Info/Archive.vue")
  },
  {
    path: '/archive/:sid',
    name: 'ArchiveDetail',
    component: () => import(/* webpackChunkName: "archive-detail" */ "@/pages/Info/ArchiveDetail.vue")
  },
  {
    path: '/howtouse',
    name: 'HowToUse',
    component: () => import(/* webpackChunkName: "howtouse" */ "@/pages/Info/HowToUse.vue")
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import(/* webpackChunkName: "team" */ "@/pages/Info/Team.vue")
  },
  {
    path: '/contract-input1',
    name: 'ContractInput1',
    component: () => import(/* webpackChunkName: "contract-input1" */ "@/pages/Service/ContractInput1.vue"),
    meta: { hideSidebar: true }
  },
  {
    path: '/contract-input2',
    name: 'ContractInput2',
    component: () => import(/* webpackChunkName: "contract-input2" */ "@/pages/Service/ContractInput2.vue"),
    meta: { hideSidebar: true }
  },
  {
    path: '/contract-input3',
    name: 'ContractInput3',
    component: () => import(/* webpackChunkName: "contract-input3" */ "@/pages/Service/ContractInput3.vue"),
    meta: { hideSidebar: true }
  },
  {
    path: '/contract-chat',
    name: 'ContractChat',
    component: () => import(/* webpackChunkName: "contract-chat" */ "@/pages/Service/ContractChat.vue")
  },
  {
    path: '/test/socket-chat',
    name: 'SocketChat',
    component: () => import(/* webpackChunkName: "socket-chat" */ "@/pages/Test/SocketChat.vue")
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
});

export default router;
export { routes }