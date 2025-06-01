<template>
  <div class="home">
    <!-- 当有搜索查询时，可以考虑隐藏轮播图或显示不同的内容 -->
    <Carousel :items="carouselItems" :interval="3000" v-if="!searchQueryDisplay" /> 
    
    <div class="page-content container">
      <h2 class="section-title" v-if="!searchQueryDisplay">热门推荐</h2>
      <h2 class="section-title" v-if="searchQueryDisplay">搜索结果: "{{ searchQueryDisplay }}"</h2>
      
      <div class="anime-list-grid" v-if="filteredAnimeList.length">
        <AnimeCard v-for="anime in filteredAnimeList" :key="anime.id" :anime="anime" />
      </div>
      <div v-else-if="isLoading">
        <p>正在加载动漫列表...</p>
      </div>
      <div v-else-if="searchQueryDisplay && !filteredAnimeList.length">
        <p>没有找到与 "{{ searchQueryDisplay }}" 相关的动漫。</p>
      </div>
      <div v-else>
        <p>暂时没有动漫数据。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'; // 引入 computed 和 watch
import { useRoute } from 'vue-router'; // 引入 useRoute
import Carousel from '@/components/common/Carousel.vue';
import AnimeCard from '@/components/common/AnimeCard.vue';
import axios from 'axios';

const route = useRoute(); // 获取当前路由信息
const allAnimeData = ref([]); // 存储从API获取的所有动漫数据
const carouselItems = ref([]);
// animeList 将不再直接使用，而是通过 filteredAnimeList 计算得到
// const animeList = ref([]); 
const isLoading = ref(true);
const searchQueryDisplay = ref(''); // 用于显示在标题中的搜索词

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('/api/animeData.json'); 
    allAnimeData.value = response.data;
    
    // 轮播图数据保持不变或根据需要调整
    carouselItems.value = allAnimeData.value.slice(0, 6);
    
  } catch (error) {
    console.error('获取数据失败:', error);
    carouselItems.value = [{ id: 'error_carousel', title: '轮播图加载失败', coverImage: '/images/placeholder.png' }];
    allAnimeData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 计算属性，根据搜索查询过滤动漫列表
const filteredAnimeList = computed(() => {
  const query = (route.query.q || '').toString().toLowerCase().trim();
  searchQueryDisplay.value = (route.query.q || '').toString().trim(); // 更新用于显示的搜索词

  if (!query) {
    return allAnimeData.value; // 如果没有搜索查询，返回所有动漫
  }
  return allAnimeData.value.filter(anime => 
    anime.title.toLowerCase().includes(query) ||
    (anime.tags && anime.tags.some(tag => tag.toLowerCase().includes(query))) ||
    (anime.description && anime.description.toLowerCase().includes(query))
    // 可以根据需要添加更多搜索字段，例如导演、声优等
  );
});

onMounted(() => {
  fetchData();
});

// 监听路由查询参数的变化，如果需要在不重新加载组件的情况下响应搜索
// (对于HomeView，通常导航会重新加载，但这是一个好的实践)
watch(() => route.query.q, (newQuery) => {
  // searchQueryDisplay 更新已在 computed 中处理
  // 如果有其他需要根据查询参数变化而执行的逻辑，可以在这里添加
  console.log('Search query changed to:', newQuery);
}, { immediate: true }); // immediate: true 可以在组件加载时也执行一次

</script>

<style scoped>
.home {
  /* HomeView 特有的样式 */
}

.page-content {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center; /* 或左对齐，根据设计 */
  color: #333;
}

.anime-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* 响应式网格布局 */
  gap: 20px; /* 卡片之间的间距 */
}

/* 当加载或无数据时的提示样式 */
.home div[v-else-if],
.home div[v-else] {
  text-align: center;
  padding: 2rem;
  color: #777;
}
</style>