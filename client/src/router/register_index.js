export default [
    {
        path: '/auth/approval',
        name: 'approval',
        component: () => import('@/views/pages/approval/approval.vue')
    },
    {
        path: '/auth/admin-approval',
        name: 'adminapproval',
        component: () => import('@/views/pages/approval/adminApproval.vue')
    }
];
