import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import auth from '@/gateways/authentication';
import { logEvent } from '@/gateways/analytics';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/polls',
    name: 'polls',
    components: {
      header: () => import('@/views/Header.vue'),
      default: () => import('@/views/PollForm.vue'),
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/polls/:id',
    name: 'polls-id',
    components: {
      header: () => import('@/views/Header.vue'),
      default: () => import('@/views/ResponseForm.vue'),
    },
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.currentUser) {
    logEvent('view', { name: 'login' });
    return { name: 'login', query: { nextUrl: to.fullPath } };
  }
  logEvent('view', { name: to.name, user: auth.currentUser?.uid });
  return true;
});

export default router;
