<template>
  <div class="anime-card" @click="goToDetail">
    <div class="card-image-container">
      <img :src="anime.posterImage || anime.coverImage || '/images/placeholder_card.png'" :alt="anime.title" class="card-image">
      <div class="card-overlay">
        <span class="play-icon">▶</span>
        <div class="card-top-info">
          <span v-if="anime.rating" class="rating"><i class="fas fa-star"></i> {{ anime.rating }}</span>
        </div>
        <!-- Removed card-bottom-info from here -->
      </div>
      <!-- Moved card-bottom-info outside the overlay but still within image container for positioning -->
      <div class="card-bottom-info-persistent">
          <span v-if="anime.episodes" class="episodes">{{ anime.episodes }}集</span>
          <span v-if="anime.year" class="year">{{ anime.year }}</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title" :title="anime.title">{{ anime.title }}</h3>
      <p class="card-description" :title="anime.description">{{ truncateDescription(anime.description, 40) }}</p>
      <div class="card-meta">
        <span v-if="anime.genre && anime.genre.length" class="genre-tags">
          <span v-for="g in anime.genre.slice(0, 2)" :key="g" class="tag">{{ g }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  anime: {
    type: Object,
    required: true,
    default: () => ({ 
      id: 0,
      title: '未知动漫',
      description: '暂无简介',
      coverImage: '/images/placeholder_card.png',
      posterImage: null, 
      genre: [],
      year: null,
      episodes: null,
      rating: null
    })
  }
});

const router = useRouter();

const goToDetail = () => {
  if (props.anime && props.anime.id) {
    router.push({ name: 'animeDetail', params: { id: props.anime.id } });
  }
};

const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

</script>

<style scoped>
/* 引入 Font Awesome (如果您打算使用图标) - 实际项目中建议在 main.js 或 index.html 中全局引入 */
/* @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'); */

.anime-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%; 
}

.anime-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.card-image-container {
  position: relative;
  width: 100%;
  padding-top: 140%; /* 保持宽高比，例如 10:14 */
  background-color: #e9ecef; /* 更柔和的占位背景色 */
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%);
  display: flex;
  flex-direction: column; 
  justify-content: space-between; 
  align-items: center; 
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 8px;
  box-sizing: border-box;
  /* Ensure overlay does not unintentionally trap pointer events if not needed for its children */
  pointer-events: none; 
}

.anime-card:hover .card-overlay {
  opacity: 1;
}

/* Allow pointer events for children of overlay if they are interactive */
.card-overlay > * {
  pointer-events: auto;
}

.play-icon {
  color: white;
  font-size: 2.5rem; 
  text-shadow: 0 0 8px rgba(0,0,0,0.6);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-top-info {
  width: 100%;
  display: flex;
  justify-content: flex-end; 
  font-size: 0.8rem;
  color: #fff;
  /* Add z-index if it's inside overlay and needs to be above other overlay children */
  position: relative; /* Needed for z-index to take effect if not already positioned */
  z-index: 1; 
}

.rating {
  background-color: rgba(0,0,0,0.6);
  padding: 3px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.rating .fas {
  margin-right: 4px;
  color: #ffc107; /* 星星颜色 */
}

/* Styles for the persistently visible bottom info */
.card-bottom-info-persistent {
  position: absolute; /* Position it over the image */
  bottom: 8px; /* Adjust as needed */
  left: 8px;   /* Adjust as needed */
  right: 8px;  /* Adjust to make it span or control width */
  width: calc(100% - 16px); /* Adjust width considering padding */
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #fff;
  padding: 0 4px; 
  z-index: 2; /* Ensure it's above the overlay gradient if overlay is still partially visible or image */
  pointer-events: none; /* So it doesn't interfere with card click */
}

.card-bottom-info-persistent .episodes,
.card-bottom-info-persistent .year {
  background-color: rgba(0,0,0,0.7); /* Darker background for better visibility */
  padding: 3px 6px; /* Slightly more padding */
  border-radius: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.card-content {
  padding: 12px 15px; /* 调整内边距 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title {
  font-size: 1.05rem; /* 略微增大标题 */
  font-weight: 600;
  color: #2c3e50; /* 深一点的颜色 */
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(0.85rem * 1.5 * 2); 
}

.card-meta {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-top: auto;
}

.genre-tags .tag {
  background-color: #ecf0f1; /* 更亮的标签背景 */
  color: #34495e;
  padding: 3px 8px;
  border-radius: 12px; /* 更圆的标签 */
  margin-right: 5px;
  margin-bottom: 5px; /* 允许换行时有间距 */
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 500;
}
</style>