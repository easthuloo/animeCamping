<template>
  <div class="ranking-view container">
    <h2 class="page-title">动漫排行榜</h2>
    
    <div class="ranking-section">
      <h3>评分最高 Top 10</h3>
      <ul class="ranking-list" v-if="topRatedAnime.length">
        <li v-for="(anime, index) in topRatedAnime" :key="anime.id" class="ranking-item">
          <span class="rank-number">{{ index + 1 }}</span>
          <img :src="anime.posterImage || '/images/jjdjr.jpg'" :alt="anime.title" class="rank-poster">
          <div class="rank-info">
            <router-link :to="`/anime/${anime.id}`" class="rank-title">{{ anime.title }}</router-link>
            <p class="rank-rating">评分: {{ anime.rating }}</p>
          </div>
        </li>
      </ul>
      <p v-else-if="isLoading">正在加载排行榜...</p>
      <p v-else>暂无评分数据。</p>
    </div>

    <!-- 可以添加更多排行榜，例如按热度、最新等 -->
    <div class="ranking-section">
      <h3>最近更新 (示例)</h3>
      <ul class="ranking-list">
        <!-- 示例静态数据 -->
        <li class="ranking-item">
          <span class="rank-number">1</span>
          <img src="/images/0000.jpg" alt="示例动漫" class="rank-poster">
          <div class="rank-info">
            <span class="rank-title">测试动漫A (最近更新)</span>
            <p class="rank-rating">更新至: 第12话</p>
          </div>
        </li>
         <li class="ranking-item">
          <span class="rank-number">2</span>
          <img src="/images/0000.jpg" alt="示例动漫" class="rank-poster">
          <div class="rank-info">
            <span class="rank-title">测试动漫B (最近更新)</span>
            <p class="rank-rating">更新至: 第5话</p>
          </div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // 如果需要编程式导航

const router = useRouter();
const allAnimeData = ref([]);
const isLoading = ref(true);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('/api/animeData.json'); 
    allAnimeData.value = response.data;
  } catch (error) {
    console.error('获取数据失败:', error);
    allAnimeData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const topRatedAnime = computed(() => {
  if (!allAnimeData.value.length) return [];
  // 确保 rating 是数字类型进行排序
  return [...allAnimeData.value]
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 10);
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #333;
}

.ranking-section {
  margin-bottom: 40px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.ranking-section h3 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #007bff;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.ranking-list {
  list-style: none;
  padding: 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  margin-right: 15px;
  width: 30px; /* 固定宽度以便对齐 */
  text-align: center;
}

.rank-poster {
  width: 50px; /* 调整海报大小 */
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.rank-info {
  flex-grow: 1;
}

.rank-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.rank-title:hover {
  color: #0056b3;
}

.rank-rating {
  font-size: 0.9rem;
  color: #777;
  margin-top: 4px;
}

.ranking-section p {
  text-align: center;
  color: #777;
  padding: 1rem;
}
</style>