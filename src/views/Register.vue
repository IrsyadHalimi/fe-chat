<script setup>
import axios from 'axios';
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const register = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Username dan password wajib diisi.';
    return;
  }

  try {
    const res = await axios.post('http://localhost:3000/api/register', {
      username: username.value,
      password: password.value
    });
    
    // Simpan token jika pendaftaran berhasil
    localStorage.setItem('token', res.data.token);

    // Redirect ke halaman chat
    window.location.href = '/login';
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Registrasi gagal';
  }
};
</script>

<template>
  <div>
    <h2>Register</h2>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click="register">Register</button>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>
