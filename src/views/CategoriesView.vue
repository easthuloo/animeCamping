<template>
  <div class="categories-view container">
    <h2 class="page-title">动漫分类</h2>
    <div v-if="loading" class="loading-message">正在加载分类数据...</div>
    <div v-if="error" class="error-message">加载分类失败: {{ error }}</div>
    
    <div v-if="!loading && !error" class="categories-container">
      <div class="category-tags">
        <span 
          v-for="genre in uniqueGenres" 
          :key="genre"
          class="category-tag"
          :class="{ active: selectedGenre === genre }"
          @click="selectGenre(genre)"
        >
          {{ genre }}
        </span>
        <span 
          class="category-tag"
          :class="{ active: !selectedGenre }"
          @click="selectGenre(null)"
        >
          全部
        </span>
      </div>

      <div class="anime-grid" v-if="filteredAnime.length > 0">
        <div v-for="anime in filteredAnime" :key="anime.id" class="anime-card-wrapper">
          <router-link :to="`/anime/${anime.id}`" class="anime-card-link">
            <div class="anime-card">
              <img :src="anime.posterImage || anime.coverImage || '/images/default_poster.png'" :alt="anime.title" class="anime-poster">
              <div class="anime-info">
                <h3 class="anime-title">{{ anime.title }}</h3>
                <p class="anime-rating">评分: {{ anime.rating || '暂无' }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <div v-else-if="selectedGenre && !loading" class="no-anime-message">
        该分类下暂无动漫。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const allAnime = ref([]);
const uniqueGenres = ref([]);
const selectedGenre = ref(null); // null 表示显示所有动漫
const loading = ref(true);
const error = ref(null);

const fetchAnimeData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('/api/animeData.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allAnime.value = data;
    
    // 提取所有不重复的 genre
    const genres = new Set();
    data.forEach(anime => {
      if (anime.genre && Array.isArray(anime.genre)) {
        anime.genre.forEach(g => genres.add(g));
      }
    });
    uniqueGenres.value = Array.from(genres).sort();

  } catch (e) {
    console.error('获取动漫数据失败:', e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

const selectGenre = (genre) => {
  selectedGenre.value = genre;
};

const filteredAnime = computed(() => {
  if (!selectedGenre.value) {
    return allAnime.value; // 如果没有选择分类，显示全部
  }
  return allAnime.value.filter(anime => 
    anime.genre && anime.genre.includes(selectedGenre.value)
  );
});

onMounted(() => {
  fetchAnimeData();
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

.loading-message,
.error-message,
.no-anime-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
  color: #555;
}

.error-message {
  color: red;
}

.categories-container {
  margin-top: 20px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.category-tag {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 0.9rem;
}

.category-tag:hover {
  background-color: #007bff;
  color: white;
}

.category-tag.active {
  background-color: #0056b3;
  color: white;
  font-weight: bold;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.anime-card-wrapper {
  text-decoration: none;
  color: inherit;
}

.anime-card-link {
  text-decoration: none;
}

.anime-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure cards in a row have same height if content varies */
}

.anime-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.anime-poster {
  width: 100%;
  height: 250px; /* Fixed height for posters */
  object-fit: cover; /* Crop image to fit */
}

.anime-info {
  padding: 10px;
  text-align: center;
  flex-grow: 1; /* Allow info to take remaining space */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes rating to bottom if title is short */
}

.anime-title {
  font-size: 1rem;
  margin: 0 0 5px 0;
  color: #333;
  /* Clamp title to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em; /* Approximate height for 2 lines */
}

.anime-rating {
  font-size: 0.85rem;
  color: #666;
  margin-top: auto; /* Pushes rating to the bottom */
}
</style>