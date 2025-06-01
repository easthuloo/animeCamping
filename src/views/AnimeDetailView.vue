<template>
  <div class="anime-detail-page container" v-if="anime">
    <div class="detail-header">
      <div class="poster-container">
        <img :src="anime.posterImage || anime.coverImage || '/images/placeholder_detail.png'" :alt="anime.title" class="poster-image">
      </div>
      <div class="info-container">
        <h1>{{ anime.title }}</h1>
        <div class="meta-info">
          <span v-if="anime.year" class="year">年份：{{ anime.year }}</span>
          <span v-if="anime.episodes" class="episodes">集数：{{ anime.episodes }}</span>
          <span v-if="anime.rating" class="rating"><i class="fas fa-star"></i> 评分：{{ anime.rating }}</span>
        </div>
        <div class="genres" v-if="anime.genre && anime.genre.length">
          类型：<span v-for="g in anime.genre" :key="g" class="tag">{{ g }}</span>
        </div>
        <p class="description">{{ anime.description }}</p>
        <div class="actions">
          <button class="btn btn-primary" @click="playVideo(1)"><i class="fas fa-play"></i> 立即播放</button>
          <button 
            class="btn btn-secondary"
            @click="toggleFavorite"
            :class="{ 'btn-favorited': isCurrentAnimeFavorited }"
          >
            <i :class="isCurrentAnimeFavorited ? 'fas fa-heart' : 'far fa-heart'"></i> 
            {{ isCurrentAnimeFavorited ? '已收藏' : '添加收藏' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 视频播放区域 -->
    <div class="video-player-container" v-if="currentVideoUrl">
      <iframe 
        :src="currentVideoUrl" 
        frameborder="0" 
        scrolling="no" 
        allowfullscreen="true"
        sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups"
      ></iframe>
    </div>

    <div class="detail-content">
      <section class="episodes-section" v-if="anime.episodes > 0"> <!-- 假设剧集信息后续会更丰富 -->
        <h2>剧集列表</h2>
        <ul class="episode-list">
          <li 
            v-for="i in anime.episodes" 
            :key="i" 
            class="episode-item"
            :class="{ 'active-episode': currentEpisode === i }"
            @click="playVideo(i)"
          >
            第 {{ i }} 集
          </li>
        </ul>
      </section>

      <!-- 评论区 -->
      <section class="comments-section">
        <h3>评论区</h3>
        <div v-if="authStore.user" class="comment-form">
          <textarea v-model="newCommentText" @keydown.enter="handleEnterComment" placeholder="请输入你的评论..."></textarea>
          <button @click="handleAddComment">发表评论</button>
        </div>
        <div v-else class="comment-login-prompt">
          <p>请 <router-link to="/login">登录</router-link> 后发表评论。</p>
        </div>

        <div class="comment-list" v-if="comments.length > 0">
          <h4>全部评论 ({{ comments.length }})</h4>
          <ul>
            <li v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <div class="comment-author">
                  <img :src="comment.avatar" alt="avatar" class="comment-avatar">
                  <span>{{ comment.user }}</span>
                </div>
                <button 
                  v-if="authStore.user && authStore.user.username === comment.user"
                  @click="handleDeleteComment(comment.id)" 
                  class="delete-comment-btn"
                >
                  删除
                </button>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
              <span class="comment-timestamp">{{ comment.timestamp }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="no-comments">
          <p>暂无评论，快来抢沙发吧！</p>
        </div>
      </section>
    </div>

  </div>
  <div v-else-if="isLoading" class="loading-container">
    <p>正在加载动漫详情...</p>
  </div>
  <div v-else class="not-found-container">
    <p>未找到该动漫的信息。</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';

const route = useRoute();
const router = useRouter();
const anime = ref(null);
const isLoading = ref(true);
const comments = ref([]);
const newCommentText = ref('');
const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();

const currentVideoUrl = ref(''); // 当前播放的视频URL
const currentEpisode = ref(0); // 当前播放的集数

// 计算属性，判断当前动漫是否已收藏
const isCurrentAnimeFavorited = computed(() => {
  return anime.value ? favoritesStore.isFavorite(anime.value.id) : false;
});

// 切换收藏状态的方法
const toggleFavorite = () => {
  if (!authStore.user) {
    alert('请先登录后再进行收藏操作！');
    router.push('/login');
    return;
  }
  if (anime.value) {
    favoritesStore.toggleFavorite(anime.value.id);
  }
};

const fetchAnimeDetail = async (id) => {
  isLoading.value = true;
  anime.value = null;
  window.scrollTo(0, 0);
  try {
    const response = await axios.get('/api/animeData.json');
    const allAnime = response.data;
    const foundAnime = allAnime.find(a => String(a.id) === String(id)); 
    if (foundAnime) {
      anime.value = foundAnime;
      loadComments(id);
      // 默认播放第一集，如果存在视频链接
      if (anime.value.videoUrls && anime.value.videoUrls.length > 0) {
        playVideo(1); 
      }
    } else {
      console.warn(`未找到 ID 为 ${id} 的动漫`);
    }
  } catch (error) {
    console.error('获取动漫详情失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 播放视频的方法
const playVideo = (episodeNum) => {
  if (!anime.value || !anime.value.videoUrls || anime.value.videoUrls.length === 0) {
    alert('暂无视频资源。');
    currentVideoUrl.value = '';
    currentEpisode.value = 0;
    return;
  }

  // 假设 anime.videoUrls 是一个数组，索引对应集数 (0-indexed)
  // 或者是一个对象，key 是集数，value 是 URL
  // 这里我们假设 anime.videoUrls 是一个数组，且 episodeNum 从 1 开始
  const videoIndex = episodeNum - 1;
  if (videoIndex >= 0 && videoIndex < anime.value.videoUrls.length) {
    currentVideoUrl.value = anime.value.videoUrls[videoIndex];
    currentEpisode.value = episodeNum;
    // 滚动到视频播放器位置
    const videoPlayer = document.querySelector('.video-player-container');
    if (videoPlayer) {
      videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    alert(`第 ${episodeNum} 集暂无视频资源。`);
    currentVideoUrl.value = '';
    currentEpisode.value = 0;
  }
};

const loadComments = (animeId) => {
  const storedComments = localStorage.getItem(`anime_${animeId}_comments`);
  if (storedComments) {
    comments.value = JSON.parse(storedComments);
  } else {
    comments.value = [];
  }
};

const saveComments = (animeId) => {
  localStorage.setItem(`anime_${animeId}_comments`, JSON.stringify(comments.value));
};

const handleAddComment = () => {
  if (!newCommentText.value.trim()) {
    alert('评论内容不能为空！');
    return;
  }
  if (!authStore.user) {
    alert('请先登录后再发表评论！');
    router.push('/login');
    return;
  }
  const newComment = {
    id: Date.now(),
    user: authStore.user.username,
    avatar: authStore.user.avatar || '/images/default_avatar.png', // 使用默认头像或用户自定义头像
    text: newCommentText.value,
    timestamp: new Date().toLocaleString(),
  };
  comments.value.unshift(newComment);
  newCommentText.value = '';
  if (anime.value) {
    saveComments(anime.value.id);
  }
};

const handleEnterComment = (event) => {
  if (event.shiftKey) {
    return;
  } else {
    event.preventDefault();
    handleAddComment();
  }
};

const handleDeleteComment = (commentId) => {
  if (!authStore.user) return;

  const commentToDelete = comments.value.find(comment => comment.id === commentId);
  if (commentToDelete && commentToDelete.user === authStore.user.username) {
    if (confirm('确定要删除这条评论吗？')) {
      comments.value = comments.value.filter(comment => comment.id !== commentId);
      if (anime.value) {
        saveComments(anime.value.id);
      }
    }
  } else {
    alert('你只能删除自己的评论。');
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchAnimeDetail(newId);
  }
}, { immediate: true });

</script>

<style scoped>
.anime-detail-page {
  padding: 2rem;
}

.detail-header {
  display: flex;
  gap: 2rem; /* 海报和信息之间的间距 */
  margin-bottom: 2rem;
}

.poster-container {
  flex-shrink: 0;
  width: 250px; /* 海报宽度 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.poster-image {
  width: 100%;
  height: auto;
  display: block;
}

.info-container {
  flex-grow: 1;
}

.info-container h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.meta-info {
  display: flex;
  gap: 1rem; /* 元信息之间的间距 */
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1rem;
}

.meta-info .fas {
  margin-right: 0.3rem;
  color: #f39c12;
}

.genres {
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.genres .tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.description {
  font-size: 1rem;
  line-height: 1.7;
  color: #444;
  margin-bottom: 1.5rem;
  white-space: pre-wrap; /* 保留换行和空格 */
}

.actions .btn {
  margin-right: 1rem;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
}

.actions .btn .fas {
  margin-right: 0.5rem;
}

/* 视频播放器样式 */
.video-player-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  margin-bottom: 2rem;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.detail-content section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.detail-content h2, .comments-section h3 {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.episode-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.8rem;
}

.episode-item {
  background-color: #fff;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.episode-item:hover {
  background-color: var(--primary-dark-color); /* 使用深一点的主题色作为背景 */
  color: #000000; /* 文字颜色保持白色或浅色以保证对比度 */
  border-color: var(--primary-dark-color);
}

.episode-item.active-episode {
  background-color: var(--primary-color); /* 选中集数的背景色 */
  color: #000000;
  border-color: var(--primary-color);
}

.loading-container, .not-found-container {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #777;
}

/* 评论区样式 */
.comments-section {
  margin-top: 2rem;
  /* padding: 1.5rem; */ /* 已在 detail-content section 中设置 */
  /* background-color: #f9f9f9; */ /* 已在 detail-content section 中设置 */
  /* border-radius: 8px; */ /* 已在 detail-content section 中设置 */
}

.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

.comment-form button {
  padding: 0.6rem 1.2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.comment-form button:hover {
  background-color: var(--primary-dark-color);
}

.comment-login-prompt {
  padding: 1rem;
  text-align: center;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.comment-login-prompt a {
  color: var(--primary-color);
  font-weight: bold;
}

.comment-list h4 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem; /* 调整字号 */
  color: #444;
}

.comment-list ul {
  list-style-type: none;
  padding: 0;
}

.comment-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  background-color: #fff; /* 给评论项一个背景色 */
  border-radius: 4px;
  position: relative; /* 为了删除按钮的定位（如果需要绝对定位） */
}

.comment-header {
  display: flex;
  justify-content: space-between; /* 让作者信息和删除按钮分开 */
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  display: flex;
  align-items: center;
  /* margin-bottom: 0.5rem; */ /* 从这里移到 .comment-header */
}

.delete-comment-btn {
  background-color: transparent;
  border: none;
  color: #dc3545; /* 红色，表示删除 */
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
}

.delete-comment-btn:hover {
  text-decoration: underline;
  color: #a71d2a;
}

.comment-author {
  display: flex;
  align-items: center;
  /* margin-bottom: 0.5rem; */ /* 从这里移到 .comment-header */
}

.comment-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 0.8rem;
  object-fit: cover;
}

.comment-author span {
  font-weight: bold;
  color: #555;
}

.comment-text {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap; /* 保留评论内容的换行 */
}

.comment-timestamp {
  font-size: 0.85rem;
  color: #888;
  display: block; /* 让时间戳独占一行或靠右 */
  text-align: right;
}

.no-comments {
  text-align: center;
  padding: 1rem;
  color: #777;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .poster-container {
    width: 80%;
    max-width: 300px;
    margin-bottom: 1.5rem;
  }
  .info-container h1 {
    font-size: 1.8rem;
  }
  .meta-info {
    justify-content: center;
    flex-wrap: wrap;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  .actions .btn {
    width: 80%;
    margin-right: 0;
  }
}

.btn-favorited {
  color: #ff4d4f; /* 收藏后的颜色，例如红色 */
 
}

.btn-favorited:hover {
  color: #cf1322; /* 收藏后hover的颜色 */

}
</style>

