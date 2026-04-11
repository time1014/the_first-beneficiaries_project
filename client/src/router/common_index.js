export default [
    {
        path: '/common/:no',
        name: 'common',
        component: () => import('@/views/pages/common/Common.vue'),
        children: [
            {
                path: 'counselCheck',
                name: 'counselCheck',
                component: () => import('@/components/counsel/CounselCheck.vue')
            },
            {
                path: 'priorityCheck',
                name: 'priorityCheck',
                component: () => import('@/components/priority/PriorityCheck.vue')
            },
            {
                path: 'planCheck',
                name: 'planCheck',
                component: () => import('@/components/plan/PlanCheck.vue')
            },
            {
                path: 'resultCheck',
                name: 'resultCheck',
                component: () => import('@/components/result/ResultCheck.vue')
            },
            {
                path: 'surveyCheck',
                name: 'surveyCheck',
                component: () => import('@/components/survey/SurveyCheck.vue')
            }
        ]
    },
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
    },
    {
        path: '/dashboard_user',
        name: 'dashboard_user',
        component: () => import('@/views/Dashboard_user.vue')
    }
];
