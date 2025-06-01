import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AnimeDetailView from '../views/AnimeDetailView.vue'
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import CategoriesView from '../views/CategoriesView.vue'; // 新增导入
import RankingView from '../views/RankingView.vue'; // 新增导入
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/anime/:id',
      name: 'animeDetail',
      component: AnimeDetailView,
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView // 新增路由
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingView // 新增路由
    }
  ]
});

// 添加导航守卫 (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // 将 useAuthStore() 调用移到这里
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 如果目标路由需要认证且用户未登录
    next({ name: 'login', query: { redirect: to.fullPath } }); // 重定向到登录页，并附带原始目标路径
  } else {
    next(); // 否则，正常导航
  }
});

export default router;
