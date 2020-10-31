import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import auth from '@/gateways/authentication';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    components: {
      default: () => import('../views/Login.vue'),
    },
  },
  {
    path: '/polls',
    name: 'polls',
    components: {
      header: () => import('../views/Header.vue'),
      default: () => import('../views/PollForm.vue'),
    },
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/polls/:id',
    name: 'polls-id',
    components: {
      header: () => import('../views/Header.vue'),
      default: () => import('../views/ResponseForm.vue'),
    },
    meta: {
      requiresAuth: true,
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (requiresAuth && !auth.currentUser) {
    next({ name: 'login', params: { nextUrl: to.fullPath } });
  } else {
    next();
  }
});

export default router;
