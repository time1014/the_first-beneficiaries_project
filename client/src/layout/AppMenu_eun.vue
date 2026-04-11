<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 롤별 메뉴 구성
const menuByRole = {
    e1: ['HOME_USER', 'MYPAGE', 'SURVEY_INPUT', 'NOTICE'],
    e2: ['HOME', 'MYPAGE', 'NOTICE'],
    e3: ['HOME', 'MYPAGE', 'APPROVAL', 'SEARCH', 'MANAGER', 'NOTICE'],
    e4: ['INSTITUTIONLIST', 'ADMINAPPROVAL', 'SURVEY', 'ADMIN', 'NOTICE']
};

// 메뉴 정의
const MENU = {
    // 지원신청내역(홈)
    HOME: { label: '지원신청내역', to: '/', icon: 'pi pi-check-square' },
    HOME_USER: { label: '지원신청내역', to: '/dashboard_user', icon: 'pi pi-check-square' },

    // 마이페이지
    MYPAGE: {
        e1: { label: '마이페이지', to: '/pages/mypage', icon: 'pi pi pi-user' },
        e2: { label: '마이페이지', to: '/institutioninfo', icon: 'pi pi pi-user' },
        e3: { label: '마이페이지', to: '/admin/institutioninfo', icon: 'pi pi pi-user' }
    },

    // 관리자/공통 메뉴
    MANAGER: { label: '담당자 조회', to: '/info/manager', icon: 'pi pi-id-card' },
    APPROVAL: { label: '회원가입 승인요청', to: '/auth/approval', icon: 'pi pi-clock' },
    NOTICE: { label: '공지사항', to: '/notice', icon: 'pi pi-bell' },

    // 일반사용자 메뉴
    SURVEY_INPUT: { label: '지원신청서 등록', to: '/survey/input', icon: 'pi pi-file-edit' },

    // 시스템관리자 메뉴
    SURVEY: { label: '지원신청서 관리', to: '/survey', icon: 'pi pi-file-edit' },
    INSTITUTIONLIST: { label: '기관목록', to: '/sysadmin/institutions', icon: 'pi pi-home' },
    ADMINAPPROVAL: { label: '회원가입 승인요청', to: '/auth/admin-approval', icon: 'pi pi-clock' },
    ADMIN: { label: '관리자 조회', to: '/info/admin', icon: 'pi pi-id-card' }
};

const model = computed(() => {
    const role = userStore.role;

    // 해당 권한에 맞는 메뉴 key 배열 가져와서 실제 menu 객체로 변환
    const items = (menuByRole[role] || [])
        .map((key) => {
            // 마이페이지는 롤별로 경로 다르기 때문에 따로 처리
            if (key === 'MYPAGE') {
                return MENU.MYPAGE[role];
            }
            // 나머지는 공통 menu에서 그대로 가져옴
            return MENU[key];
        })
        .filter(Boolean);
    return [{ items }];
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <template v-if="!item.separator">
                <AppMenuItem :item="item" :index="i" />
            </template>
            <li v-else class="menu-separator"></li>
        </template>
    </ul>
</template>
