export default [
    // 기관 목록 페이지
    {
        path: '/sysadmin/institutions',
        name: 'sysadmin-institutions',
        component: () => import('@/views/pages/sysadmin_institution/SysAdminInstitutionList.vue'),
        meta: { roles: ['e4'] }
    },
    // 기관 상세 페이지
    {
        path: '/sysadmin/institutions/:institutionNo',
        name: 'sysadmin-institution-detail',
        component: () => import('@/views/pages/sysadmin_institution/SysAdminInstitutionDetail.vue'),
        meta: { roles: ['e4'] }
    },
    // 기관 등록 페이지
    {
        path: '/sysadmin/institutions/create',
        name: 'sysadmin-institution-create',
        component: () => import('@/views/pages/sysadmin_institution/SysAdminInstitutionForm.vue'),
        meta: { roles: ['e4'] }
    },
    // 기관 수정 페이지
    {
        path: '/sysadmin/institutions/:institutionNo/edit',
        name: 'sysadmin-institution-edit',
        component: () => import('@/views/pages/sysadmin_institution/SysAdminInstitutionForm.vue'),
        meta: { roles: ['e4'] }
    }
];
