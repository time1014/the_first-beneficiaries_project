<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import logoImage from '@/assets/logo/logo1.png';

const { toggleMenu } = useLayout();

const userStore = useUserStore();
const router = useRouter();

const logOut = () => {
    userStore.logout();
    router.push('/sign/login');
};

const roleName = computed(() => {
    const roleMap = {
        e1: '일반이용자',
        e2: '기관담당자',
        e3: '기관관리자',
        e4: '시스템관리자'
    };
    return roleMap[userStore.role] || '사용자';
});

const userName = computed(() => userStore.user_name || '');
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo flex items-center">
                <img :src="logoImage" alt="Logo" class="h-[4.0rem] w-auto object-contain" />
                <span class="ml-0 whitespace-nowrap">First Step</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu flex items-center gap-3">
                <div class="text-sm font-medium whitespace-nowrap">{{ userName }}({{ roleName }})님 반갑습니다.</div>
                <Button label="로그아웃" raised @click="logOut" />
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveToClass: 'hidden', leaveActiveClass: 'p-anchored-overlay-leave-active', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>
    </div>
</template>
