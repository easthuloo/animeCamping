<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-logo">
        动漫宿营地
      </router-link>

      <div class="search-container">
        <!-- 修改 input 以使用 v-model 和 @keyup.enter -->
        <input 
          type="text" 
          placeholder="搜索动漫..." 
          class="search-input" 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
        >
        <!-- 修改 button 以调用 handleSearch -->
        <button class="search-button" @click="handleSearch">搜索</button>
      </div>

      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>

      <ul :class="['nav-menu', { 'active': isMenuOpen }]">
        <li class="nav-item">
          <router-link to="/" class="nav-link" @click="closeMenu">首页</router-link>
        </li>
        <li class="nav-item">
          <!-- 更新 to 属性 -->
          <router-link to="/categories" class="nav-link" @click="closeMenu">分类</router-link>
        </li>
        <li class="nav-item nav-item-ranking"> <router-link to="/ranking" class="nav-link" @click="closeMenu">排行</router-link>
        </li>
        
        <!-- 用户操作区域 -->
        <li v-if="!authStore.isLoggedIn" class="nav-item nav-item-right auth-group">
          <router-link to="/login" class="nav-link auth-link" @click="closeMenu">登录</router-link>
        </li>
        <li v-if="!authStore.isLoggedIn" class="nav-item auth-group">
          <router-link to="/register" class="nav-link auth-link" @click="closeMenu">注册</router-link>
        </li>

        <li v-if="authStore.isLoggedIn" class="nav-item nav-item-right dropdown user-profile-dropdown">
          <a href="#" class="nav-link user-avatar-link" @click.prevent="toggleUserMenu">
            <img :src="userAvatar" alt="User Avatar" class="user-avatar">
            <span class="username">{{ authStore.currentUser?.username }}</span>
          </a>
          <ul class="dropdown-menu" v-if="isUserMenuOpen">
            <li><router-link to="/profile" @click="closeUserMenuAndNav">个人中心</router-link></li>
            <li><a href="#" @click.prevent="handleLogout">退出登录</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter
import { useAuthStore } from '@/stores/auth';
import defaultAvatar from '/images/default_avatar.png';

const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const router = useRouter(); // 获取 router 实例
const authStore = useAuthStore();
const searchQuery = ref(''); // 新增：用于绑定搜索框输入

const userAvatar = computed(() => {
  // 实际应用中，用户头像可能来自 authStore.currentUser.avatarUrl
  return defaultAvatar; 
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    isUserMenuOpen.value = false; // 关闭用户菜单如果主菜单打开
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    isMenuOpen.value = false; // 关闭主菜单如果用户菜单打开
  }
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const closeUserMenuAndNav = () => {
  closeUserMenu();
  closeMenu();
}

const handleSearch = () => {
  if (searchQuery.value.trim() === '') {
    // 如果搜索词为空，可以导航到首页或不执行任何操作
    router.push('/'); 
    return;
  }
  // 导航到首页，并带上搜索查询参数
  router.push({ name: 'home', query: { q: searchQuery.value.trim() } });
  searchQuery.value = ''; // 清空搜索框 (可选)
  closeMenu(); // 如果菜单是打开的，关闭它
};

const handleLogout = () => {
  authStore.logout();
  closeUserMenu();
  closeMenu();
  router.push('/login');
  alert('已退出登录'); // 临时提示
};

// 点击外部关闭菜单
// 这部分逻辑可以根据需要添加，例如通过 document.addEventListener
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 0.8rem 1.5rem;
  color: white;
  position: sticky; /* 保持sticky属性 */
  top: 0;            /* 确保贴顶 */
  left: 0;           /* 确保从左边开始 */
  right: 0;          /* 确保宽度充满 */
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 0 !important; /* 强制移除可能存在的顶部外边距 */
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-logo {
  color: white;
  text-decoration: none;
  font-size: 1.8em;
  font-weight: bold;
}

.search-container {
  display: flex;
  align-items: center;
  flex-grow: 0.5; /* 让搜索框占据一些空间，但不要太多 */
  max-width: 400px; /* 限制最大宽度 */
  margin: 0 20px; /* 与两边元素的间距 */
}

.search-input {
  padding: 0.5rem 0.8rem;
  border: 1px solid #555;
  border-radius: 20px 0 0 20px;
  background-color: #444;
  color: white;
  outline: none;
  flex-grow: 1;
  font-size: 0.9em;
}

.search-input::placeholder {
  color: #aaa;
}

.search-button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #0056b3;
}

.nav-menu {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-left: 15px; /* 统一设置左边距 */
}

/* 给排行菜单项增加一些右边距，或者给右侧用户操作区域增加左边距 */
.nav-item-ranking {
  margin-right: 20px; /* 增加排行和右侧元素的间距 */
}

/* 或者给用户操作区域的第一个元素增加左边距 */
.auth-group:first-of-type,
.user-profile-dropdown {
  margin-left: 20px; /* 确保与排行有足够间距 */
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  display: block;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 4px;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #00bcd4; /* 青色高亮 */
}

/* 移除登录注册按钮的默认边框 */
.auth-link {
  border: none !important; /* 移除边框 */
  outline: none !important; /* 移除焦点时的轮廓 */
  padding: 0.5rem 0.8rem; /* 保持和其他链接一样的padding */
}


.user-avatar-link {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #fff;
}

.username {
  font-size: 0.9em;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #444;
  border: 1px solid #555;
  border-radius: 4px;
  list-style: none;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  min-width: 120px;
  z-index: 1001;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.dropdown-menu li a {
  display: block;
  padding: 0.5rem 1rem;
  color: white;
  text-decoration: none;
  font-size: 0.9em;
}

.dropdown-menu li a:hover {
  background-color: #555;
}


/* 汉堡菜单 */
.menu-toggle {
  display: none; /* 默认隐藏 */
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
}

.hamburger {
  display: block;
  width: 25px;
  height: 3px;
  background-color: white;
  position: relative;
  transition: transform 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 25px;
  height: 3px;
  background-color: white;
  left: 0;
  transition: transform 0.3s ease, top 0.3s ease;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  top: 8px;
}

/* 响应式设计 */
@media (max-width: 992px) { /* 中等屏幕，可以调整断点 */
  .search-container {
    margin: 0 10px;
    max-width: 300px;
  }
  .nav-item {
    margin-left: 1rem;
  }
}

@media (max-width: 768px) { /* 小屏幕断点 */
  .search-container {
    order: 3; /* 将搜索框放到最后 */
    width: calc(100% - 40px); /* 占据大部分宽度 */
    margin: 10px 20px 0 20px; /* 上下边距 */
    max-width: none;
  }

  .navbar-container {
    flex-wrap: wrap; /* 允许换行 */
  }

  .menu-toggle {
    display: block; /* 显示汉堡菜单按钮 */
    order: 2; /* 调整顺序 */
  }

  .nav-menu {
    display: none; /* 隐藏导航菜单 */
    flex-direction: column;
    width: 100%;
    background-color: #333; /* 与navbar背景色一致 */
    position: absolute;
    top: 60px; /* 根据navbar高度调整 */
    left: 0;
    padding: 1rem 0;
    border-top: 1px solid #444;
    order: 4;
  }

  .nav-menu.active {
    display: flex; /* 点击后显示 */
  }

  .nav-item {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .nav-link {
    display: block;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #444;
  }
  .nav-link:hover,
  .nav-link.router-link-active {
    background-color: #444;
  }

  .auth-link {
    display: inline-block; /* 保持内联块特性 */
    margin: 0.5rem auto;
  }

  .nav-item-right {
    margin-left: 0; /* 在堆叠时移除自动边距 */
  }

  .dropdown {
    width: 100%;
  }
  .dropdown-menu {
    position: static; /* 在移动端，下拉菜单不再绝对定位 */
    width: 100%;
    box-shadow: none;
    border-top: 1px solid #555;
    margin-top: 0;
  }
  .dropdown-menu li a {
     text-align: center;
  }

  /* 汉堡菜单激活状态 */
  .menu-toggle.active .hamburger {
    transform: rotate(45deg);
  }
  .menu-toggle.active .hamburger::before {
    top: 0;
    transform: rotate(90deg);
  }
  .menu-toggle.active .hamburger::after {
    top: 0;
    transform: rotate(90deg);
    opacity: 0; /* 或者也旋转90度，形成X */
  }
}

</style>