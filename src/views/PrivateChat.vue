<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const socket = io('http://localhost:3000');
const message = ref('');
const inputRef = ref(null);

const users = ref([]);
const selectedUser = ref(null);
const privateMessages = ref([]);

const fetchUser = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(atob(token.split('.')[1]));

    const res = await fetch(`http://localhost:3000/api/chats/${user.id}`);
    users.value = await res.json();
};

const selectUser = async (targetId) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(atob(token.split('.')[1]));
    selectedUser.value = targetId;

    socket.emit('joinRoom', { userId: user.id, targetId });

    const res = await fetch(`http://localhost:3000/api/messages/${user.id}/${targetId}`);
    privateMessages.value = await res.json();
}

const sendMessage = () => {
  const token = localStorage.getItem('token');

  if (!token || !selectedUser.value) return;

  try {
    const user = JSON.parse(atob(token.split('.')[1]));
    if (!message.value.trim()) return;

    socket.emit('private message', {
      senderId: user.id,
      receiverId: selectedUser.value,
      message: message.value
    });

    privateMessages.value.push({
        sender_id: user.id,
        receiver_id: selectedUser.value,
        message: message.value,
        created_at: new Date()
    });

    message.value = '';
    inputRef.value?.focus(); // kembalikan fokus ke input
  } catch (error) {
    alert('Token tidak valid, silakan login ulang.');
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username.value = payload.username;
    fetchUser();
  }

  socket.on('private message', (msg) => {
    if (selectedUser.value && (msg.senderId === selectedUser.value || msg.receiverId === selectedUser.value)) {
      privateMessages.value.push(msg);
    }
  });
});

const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    socket.disconnect();
    socket.off('chat message'); // Hentikan mendengarkan pesan saat logout
}
</script>

<template>
  <span>Selamat datang, {{ username }}</span>
  <br>
  <div>
      <h3>Chat dengan:</h3>
      <ul>
          <li
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user.id)"
          style="cursor: pointer;"
          >
          {{ user.username }}
        </li>
    </ul>
</div>
<div>
    <div v-if="selectedUser">
        <h3>Chat dengan user {{ selectedUser }}</h3>
        <ul>
            <li v-for="(msg, i) in privateMessages" :key="i">
                <strong>{{ msg.sender_id }}:</strong> {{ msg.message }}
            </li>
        </ul>
        <input 
        ref="inputRef"
        v-model="message"
        @keyup.enter="sendMessage"
        placeholder="Ketik pesan..."
        />
        <button @click="sendMessage">Kirim</button><br />
        <button @click="logout">Logout</button>
    </div>
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
