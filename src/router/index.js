import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import ChatView from '../views/Chat.vue';
import PrivateChatView from '../views/PrivateChat.vue';
import InvitationView from '../views/Invitation.vue';

const routes = [
    { path: '/', redirect: '/chat' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/chat', name: 'chat', component: ChatView },
    { path: '/private-chat', name: 'private-chat', component: PrivateChatView },
    { path: '/invitation', name: 'invitation', component: InvitationView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.path === '/chat' && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;