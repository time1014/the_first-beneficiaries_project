export default [
    {
        path: '/survey',
        name: 'survey',
        component: () => import('@/views/pages/survey/survey.vue')
    },
    {
        path: '/survey/input',
        name: 'surveyInput',
        component: () => import('@/views/pages/survey/surveyInput.vue')
    }
];
