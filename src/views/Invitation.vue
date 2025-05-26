<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const username = ref('');
const users = ref([]);
const invitations = ref([]);
const acceptedUsers = ref([]);

const currentUserId = ref(null);

const fetchUser = async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(atob(token.split('.')[1]));
  currentUserId.value = user.id;

  const res = await fetch(`http://localhost:3000/api/chats/${user.id}`);
  users.value = await res.json();
};

const fetchInvitations = async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(atob(token.split('.')[1]));

  const res = await fetch(`http://localhost:3000/api/invitations/${user.id}`);
  const data = await res.json();
  invitations.value = data;

  acceptedUsers.value = data
    .filter(inv => inv.status === 'accepted')
    .map(inv =>
      inv.sender_id === user.id ? inv.receiver_id : inv.sender_id
    );
};

const sendInvite = async (targetId) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(atob(token.split('.')[1]));

  await fetch('http://localhost:3000/api/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: user.id,
      receiverId: targetId
    })
  });

  await fetchInvitations();
};

const acceptInvite = async (senderId) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(atob(token.split('.')[1]));

  await fetch(`http://localhost:3000/api/invitations/${user.id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'accepted',
    })
  }); 

  await fetchInvitations();
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    username.value = payload.username;
    currentUserId.value = payload.id;
    fetchUser();
    fetchInvitations();
  }
});
</script>

<template>
  <span>Selamat datang, {{ username }}</span>
  <br>
  <div>
    <h3>Undangan Chat:</h3>
    <ul>
        <li v-for="user in users" :key="user.id" style="cursor: pointer;">
            {{ user.username }}
            <template v-if="acceptedUsers.includes(user.id)">
                <span style="color: green;">Berteman</span>
            </template>
            <template v-else-if="invitations.some(i => i.sender_id === user.id && i.receiver_id === currentUserId && i.status === 'pending')">
                <button @click="acceptInvite(user.id)">Terima Undangan</button>
            </template>
            <template v-else-if="invitations.some(i => i.sender_id === currentUserId && i.receiver_id === user.id && i.status === 'pending')">
                <span>Menunggu konfirmasi</span>
            </template>
            <template v-else>
                <button @click="sendInvite(user.id)">Undang</button>
            </template>
        </li>
    </ul>
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
