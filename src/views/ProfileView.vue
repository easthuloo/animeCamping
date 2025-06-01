<template>
  <div class="profile-view">
    <h2>用户个人中心</h2>
    <div v-if="authStore.isLoggedIn && authStore.currentUser" class="profile-content">
      <div class="profile-details">
        <div class="avatar-section">
          <img :src="userAvatar" alt="User Avatar" class="profile-avatar">
        </div>
        <div class="info-section">
          <p><strong>用户名:</strong> {{ authStore.currentUser.username }}</p>
          <p><strong>邮箱:</strong> {{ authStore.currentUser.email }}</p>
        </div>
        <button @click="handleLogout" class="logout-button">退出登录</button>
      </div>

      <div class="favorites-section">
        <h3>我的收藏</h3>
        <div v-if="loadingFavorites" class="loading-message">正在加载收藏列表...</div>
        <div v-else-if="favoriteAnimes.length > 0" class="favorites-grid">
          <div v-for="anime in favoriteAnimes" :key="anime.id" class="anime-card-wrapper">
            <router-link :to="`/anime/${anime.id}`" class="anime-card-link">
              <div class="anime-card">
                <img :src="anime.posterImage || anime.coverImage || '/images/default_poster.png'" :alt="anime.title" class="anime-poster">
                <div class="anime-info">
                  <h4 class="anime-title">{{ anime.title }}</h4>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        <div v-else class="no-favorites-message">
          您还没有收藏任何动漫。
        </div>
      </div>

    </div>
    <div v-else class="login-prompt">
      <p>请先 <router-link to="/login">登录</router-link> 查看您的个人信息和收藏。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';
import defaultAvatar from '/images/default_avatar.png'; // 默认头像

const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();
const router = useRouter();

const allAnimeData = ref([]);
const favoriteAnimes = ref([]);
const loadingFavorites = ref(true);

const userAvatar = computed(() => {
  return authStore.currentUser?.avatarUrl || defaultAvatar;
});

const handleLogout = () => {
  authStore.logout();
  favoritesStore.clearFavoritesOnLogout(); // 退出时清空收藏（如果需要）
  alert('已退出登录');
  router.push('/login');
};

// 获取所有动漫数据，用于匹配收藏ID
const fetchAllAnimeData = async () => {
  try {
    const response = await fetch('/api/animeData.json');
    if (!response.ok) throw new Error('Failed to fetch anime data');
    allAnimeData.value = await response.json();
  } catch (error) {
    console.error('Error fetching all anime data:', error);
    // 可以设置一个错误状态供UI显示
  }
};

// 加载用户收藏的动漫详情
const loadFavoriteAnimes = async () => {
  if (!authStore.isLoggedIn || allAnimeData.value.length === 0) {
    favoriteAnimes.value = [];
    loadingFavorites.value = false;
    return;
  }
  loadingFavorites.value = true;
  // 确保 favoritesStore.favoriteAnimeIds 是最新的
  // Pinia store 应该是响应式的，但如果涉及到localStorage的初始化，确保它已完成
  // favoritesStore.loadFavorites(); // 如果有手动加载localStorage的逻辑

  const favIds = favoritesStore.favoriteAnimeIds;
  if (favIds.length === 0) {
    favoriteAnimes.value = [];
    loadingFavorites.value = false;
    return;
  }
  
  favoriteAnimes.value = allAnimeData.value.filter(anime => favIds.includes(anime.id));
  loadingFavorites.value = false;
};

onMounted(async () => {
  await fetchAllAnimeData(); // 首先加载所有动漫数据
  if (authStore.isLoggedIn) {
    // favoritesStore.loadFavorites(); // 确保收藏已从localStorage加载
    loadFavoriteAnimes();
  }
});

// 监听登录状态变化，重新加载收藏
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    // favoritesStore.loadFavorites(); // 确保收藏已从localStorage加载
    loadFavoriteAnimes();
  } else {
    favoriteAnimes.value = [];
  }
});

// 监听收藏列表变化 (例如，在详情页添加/取消收藏后)
watch(() => favoritesStore.favoriteAnimeIds, () => {
    if (authStore.isLoggedIn) {
        loadFavoriteAnimes();
    }
}, { deep: true });

</script>

<style scoped>
.profile-view {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.profile-view h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-details {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #007bff;
  object-fit: cover;
}

.info-section {
  flex-grow: 1;
}

.info-section p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 8px;
}

.info-section p strong {
  color: #333;
}

.logout-button {
  padding: 10px 18px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.logout-button:hover {
  background-color: #c82333;
}

.favorites-section {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.08);
}

.favorites-section h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.loading-message,
.no-favorites-message {
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 1rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.anime-card-wrapper {
  text-decoration: none;
}

.anime-card-link {
  text-decoration: none;
  color: inherit;
}

.anime-card {
  background-color: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.anime-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.anime-poster {
  width: 100%;
  height: 220px; /* Adjust as needed */
  object-fit: cover;
}

.anime-info {
  padding: 10px;
  text-align: center;
  flex-grow: 1;
}

.anime-title {
  font-size: 0.9rem;
  color: #333;
  margin: 0;
  /* Clamp title to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.2em; /* Approximate height for 2 lines */
}

.login-prompt {
  text-align: center;
  padding: 30px;
  font-size: 1.1rem;
}

.login-prompt a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.login-prompt a:hover {
  text-decoration: underline;
}
</style>