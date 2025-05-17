<script>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const message = ref('');
const messages = ref([]);

const sendMessage = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(atob(token.split('.')[1]));
    socket.emit('chat message', { userId: user.id, message: message.value });
    message.value = '';
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
      <li v-for="msg in messages" :key="msg.time">{{ msg.userId }}: {{ msg.message }}</li>
    </ul>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="Type..." />
  </div>
</template>