export default [
    {
        path: '/admin/institutioninfo',
        name: 'admin_institutioninfo',
        component: () => import('@/views/pages/mypage_e3/InstitutionInfo.vue')
    },
    {
        path: '/admin/institutioninfo/edit',
        name: 'admin_institutioninfoEdit',
        component: () => import('@/views/pages/mypage_e3/InstitutionInfoEdit.vue')
    },
    {
        path: '/institutioninfo',
        name: 'institutioninfo',
        component: () => import('@/views/pages/mypage/InstitutionInfo.vue')
    },
    {
        path: '/institutioninfo/edit',
        name: 'institutioninfo-edit',
        component: () => import('@/views/pages/mypage/InstitutionInfoEdit.vue')
    }
];
