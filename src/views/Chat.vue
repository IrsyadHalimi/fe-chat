<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const message = ref('');
const messages = ref([]);
const inputRef = ref(null); // untuk mengatur fokus

const sendMessage = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Anda belum login!');
    return;
  }

  try {
    const user = JSON.parse(atob(token.split('.')[1]));
    if (!message.value.trim()) return; // jangan kirim pesan kosong

    socket.emit('chat message', {
      userId: user.id,
      message: message.value
    });

    message.value = '';
    inputRef.value?.focus(); // kembalikan fokus ke input
  } catch (error) {
    alert('Token tidak valid, silakan login ulang.');
  }
};

onMounted(() => {
  socket.on('chat message', (msg) => {
    messages.value.push(msg);
  });
});
</script>

<template>
  <div>
    <ul>
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.userId }}</strong>: {{ msg.message }}
      </li>
    </ul>
    <input
      ref="inputRef"
      v-model="message"
      @keyup.enter="sendMessage"
      placeholder="Type your message..."
    />
    <button @click="sendMessage">Kirim</button>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}
input {
  padding: 8px;
  margin-right: 8px;
}
button {
  padding: 8px 12px;
  cursor: pointer;
}
</style>
