<script>
import axios from 'axios';
import { ref } from 'vue';

const username = ref('');
const password = ref('');

const login = async () => {
    const res = await axios.post('http://localhost:3000/api/login', {
        username: username.value,
        password: password.value
    });
    localStorage.setItem('token', res.data.token);
    window.location.href = '/chat';
};
</script>
<template>
  <div>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click="login">Login</button>
  </div>
</template>

