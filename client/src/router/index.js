import AppLayout from '@/layout/AppLayout.vue';
import AppSignLayout from '@/layout/AppSignLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

import institution_index from '@/router/institution_index';
import mypage_index from '@/router/mypage_index';
import notice_index from '@/router/notice_index';
import register_index from '@/router/register_index';
import sign_index from '@/router/sign_index';
import survey_index from '@/router/survey_index';
import common_index from '@/router/common_index';
import sysadmin_institution_index from '@/router/sysadmin_institution_index';

import { useUserStore } from '@/stores/user';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/sign/login',
            component: AppSignLayout,
            children: [...sign_index]
        },
        {
            path: '/',
            component: AppLayout,
            children: [...common_index, ...institution_index, ...mypage_index, ...notice_index, ...register_index, ...survey_index, ...sysadmin_institution_index]
        }
    ]
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    //로그인 없이 접근 가능한 페이지
    const publicPages = ['/sign/login', '/sign/register', '/sign/find-password', '/sign/reset-password', '/sign/find-id', '/sign/find-id-result'];

    // 로그인 안됨
    if (!userStore.user_no) {
        if (!publicPages.includes(to.path)) {
            return next('/sign/login');
        }
        return next();
    }

    // 승인 안됨
    if (userStore.approval === 0) {
        if (to.path !== '/sign/access') {
            if ((to.path == '/sign/login' || to.path == '/sign/register', '/sign/with-draw')) {
                return next();
            }
            return next('/sign/access');
        }
        return next();
    }
    //관리자가 아닌데 회원가입 승인 페이지 갈때
    if (userStore.role !== 'e3' && to.path === '/auth/approval') {
        return next('/'); // 이 루트가 회원가입으로 되어있음 나중에 페이지 만들면 경로 수정
    }
    if (userStore.role == 'e1' && to.path === '/') {
        return next('/dashboard_user'); // 일반사용자 로그인시 일반사용자의 지원신청내역으로 이동
    }
    if (userStore.role == 'e4' && to.path === '/') {
        return next('/sysadmin/institutions'); // 시스템 관리자 로그인시 /로 안가고 기관목록으로 이동
    }

    // 승인된 유저가 승인대기 접근 막기
    if (userStore.approval === 1 && to.path === '/sign/access') {
        return next('/'); //승인된 사람이 주소에 쳐서 들어갈때 다른곳으로 이동시킬거
        // 이 루트가 회원가입으로 되어있음 나중에 페이지 만들면 경로 수정
    }

    // 롤별 페이지 접근 제한
    const requiredRoles = to.matched.find((record) => record.meta.roles)?.meta.roles;

    if (requiredRoles && !requiredRoles.includes(userStore.role)) {
        alert('접근 권한이 없습니다.');
        return next('/');
    }

    next();
});

export default router;
