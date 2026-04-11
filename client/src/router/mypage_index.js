export default [
    {
        path: '/pages/mypage',
        name: 'userMyPage',
        component: () => import('@/views/pages/mypage/MyPage.vue')
    },
    {
        path: '/info/manager',
        name: 'managerInfo',
        component: () => import('@/views/pages/info/ManagerInfo.vue')
    },
    {
        path: '/info/admin',
        name: 'adminInfo',
        component: () => import('@/views/pages/info/AdminInfo.vue')
    },
    {
        path: '/admin/mypage',
        name: 'admin-mypage',
        component: () => import('@/views/pages/mypage_e3/InstitutionInfo.vue')
    },
    {
        path: '/admin/mypage/edit',
        name: 'admin-mypage-edit',
        component: () => import('@/views/pages/mypage_e3/AdminMyInfoEdit.vue')
    },
    {
        path: '/pages/myuserinfo',
        name: 'user-mypage',
        component: () => import('@/views/pages/mypage/MyPageInfo.vue')
    }
];
