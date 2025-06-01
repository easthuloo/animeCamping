<template>
  <div class="carousel-container" v-if="items && items.length">
    <div class="main-carousel">
      <div class="carousel-slide" v-for="(item, index) in items" :key="item.id" v-show="currentIndex === index">
        <img :src="item.coverImage" :alt="item.title" class="carousel-image">
        <div class="carousel-caption">
          <h3>{{ item.title }}</h3>
        </div>
      </div>
      <button @click="prevSlide" class="carousel-control prev">&#10094;</button>
      <button @click="nextSlide" class="carousel-control next">&#10095;</button>
    </div>
    <div class="thumbnail-navigation">
      <img v-for="(item, index) in items" 
           :key="'thumb-' + item.id" 
           :src="item.thumbnailImage || item.coverImage" 
           :alt="'Thumbnail ' + item.title"
           :class="{ active: currentIndex === index }"
           @click="goToSlide(index)" 
           class="thumbnail-image">
    </div>
  </div>
  <div v-else>
    <p>加载轮播图中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [] // 包含 { id, title, coverImage, thumbnailImage? } 的对象数组
  },
  interval: {
    type: Number,
    default: 5000 // 自动轮播间隔，单位毫秒
  }
});

const currentIndex = ref(0);
let autoPlayTimer = null;

const startAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  if (props.items.length > 1) { // 只有多于一张图片时才自动播放
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, props.interval);
  }
};

const stopAutoPlay = () => {
  clearInterval(autoPlayTimer);
  autoPlayTimer = null;
};

const nextSlide = () => {
  if (props.items.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % props.items.length;
};

const prevSlide = () => {
  if (props.items.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length;
};

const goToSlide = (index) => {
  currentIndex.value = index;
  // 用户手动切换时，可以考虑重置自动播放计时器
  stopAutoPlay();
  startAutoPlay();
};

watch(() => props.items, (newItems) => {
  if (newItems && newItems.length > 0) {
    currentIndex.value = 0; // 数据变化时重置到第一张
    startAutoPlay();
  }
}, { immediate: true });

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

</script>

<style scoped>
.carousel-container {
  position: relative;
  /* max-width: 800px; */ /* 移除或注释掉固定的最大宽度 */
  width: 100%; /* 让轮播图宽度充满其父容器 */
  margin: 20px auto; /* 上下边距，左右自动居中（如果父容器有限制宽度）*/
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.main-carousel {
  position: relative;
  width: 100%;
  /* 保持宽高比，例如16:9。您可以根据图片调整或设置固定高度 */
  padding-top: 45%; /* 例如，调整为更宽的比例，或者您可以设置一个 min-height */
  /* min-height: 400px; */ /* 或者直接设置一个最小高度 */
  background-color: #f0f0f0; /* 图片未加载时的背景色 */
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  display: block;
  width: 100%; /* 让图片宽度充满幻灯片 */
  height: 100%; /* 让图片高度充满幻灯片 */
  object-fit: cover; /* 覆盖整个区域，可能会裁剪图片。可选 'contain' */
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 20px; /* 增加内边距 */
  text-align: center;
}

.carousel-caption h3 {
  margin: 0;
  font-size: 1.5rem; /* 增大标题字号 */
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  padding: 15px 20px; /* 增大控制按钮 */
  cursor: pointer;
  font-size: 2rem; /* 增大箭头图标 */
  z-index: 10;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.carousel-control:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.carousel-control.prev {
  left: 15px;
}

.carousel-control.next {
  right: 15px;
}

.thumbnail-navigation {
  display: flex;
  justify-content: center;
  padding: 15px 0; /* 增加内边距 */
  background-color: #f8f8f8;
}

.thumbnail-image {
  width: 100px; /* 增大缩略图宽度 */
  height: 56px; /* 增大缩略图高度，保持16:9 */
  object-fit: cover;
  margin: 0 8px; /* 增大缩略图间距 */
  cursor: pointer;
  border: 3px solid transparent; /* 增加边框厚度以便高亮 */
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}

.thumbnail-image.active {
  border-color: #1890ff;
  opacity: 1;
}

.thumbnail-image:hover {
  opacity: 1;
}
</style>