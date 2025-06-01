<template>
  <div class="login-view">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">登录</button>
      <p class="switch-form">
        还没有账户？ <router-link to="/register">立即注册</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // 引入 auth store

const username = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore(); // 使用 auth store

const handleLogin = () => {
  // 模拟登录逻辑 - 在纯前端项目中，这里可以检查预设的用户名密码
  // 或者，如果注册功能允许用户创建账户并存储在 localStorage，则从 localStorage 读取和验证
  if (username.value === 'testuser' && password.value === 'password123') { // 示例验证
    authStore.login({ username: username.value, email: 'testuser@example.com' }); // 假设登录成功，存储用户信息
    alert('登录成功！');
    router.push('/');
  } else {
    // 尝试从 localStorage 获取已注册用户进行验证 (如果实现了注册存储)
    const registeredUser = JSON.parse(localStorage.getItem(`user_${username.value}`));
    if (registeredUser && registeredUser.password === password.value) {
      authStore.login({ username: registeredUser.username, email: registeredUser.email });
      alert('登录成功！');
      router.push('/');
    } else {
      alert('用户名或密码错误');
    }
  }
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.login-view h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

.switch-form {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9em;
}

.switch-form a {
  color: #007bff;
  text-decoration: none;
}

.switch-form a:hover {
  text-decoration: underline;
}
</style>