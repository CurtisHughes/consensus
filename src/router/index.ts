import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import auth from '@/gateways/authentication';
import { logEvent } from '@/gateways/analytics';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/polls',
    name: 'polls',
    components: {
      header: () => import('@/views/AppHeader.vue'),
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
      header: () => import('@/views/AppHeader.vue'),
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

// Deploys delete the previous build's chunks, so a tab opened before a deploy can fail to load a
// route. Reload into it at most once per 10s so a broken deploy can't cause a reload loop.
const staleChunkErrors = new WeakSet<Error>();
const STALE_CHUNK_RELOAD_KEY = 'consensus:stale-chunk-reload';

window.addEventListener('vite:preloadError', (event) => {
  staleChunkErrors.add(event.payload);
});

router.onError((error, to) => {
  if (!staleChunkErrors.has(error)) return;
  const lastReload = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY));
  if (Date.now() - lastReload < 10_000) return;
  sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()));
  window.location.assign(to.fullPath);
});

export default router;
