<template>
  <div class="register-view">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required>
      </div>
      <button type="submit">注册</button>
      <p class="switch-form">
        已有账户？ <router-link to="/login">立即登录</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/auth'; // 注册成功后通常不需要立即登录，但可以按需添加

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致！');
    return;
  }

  // 检查用户名是否已存在 (纯前端检查)
  if (localStorage.getItem(`user_${username.value}`)) {
    alert('用户名已存在！');
    return;
  }

  // 将用户信息存储到 localStorage
  const newUser = {
    username: username.value,
    email: email.value,
    password: password.value, // 注意：实际项目中密码不应明文存储，即使在localStorage中也应加密处理
  };
  localStorage.setItem(`user_${username.value}`, JSON.stringify(newUser));
  // 也可以考虑维护一个所有用户名的列表，或者一个包含所有用户对象的数组存储在localStorage的单个键下
  // 例如： localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

  alert('注册成功！请使用您的新账户登录。');
  router.push('/login');
};
</script>

<style scoped>
.register-view {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.register-view h2 {
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
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button[type="submit"]:hover {
  background-color: #1e7e34;
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