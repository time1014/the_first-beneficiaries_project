export default [
    {
        path: '/notice',
        name: 'notice',
        component: () => import('@/views/pages/notice/NoticeList.vue'),
        meta: {
            roles: ['e1', 'e2', 'e3', 'e4']
        }
    },
    {
        path: '/notice/info/:noticeNo',
        name: 'notice_info',
        component: () => import('@/views/pages/notice/NoticeInfo.vue'),
        meta: {
            roles: ['e1', 'e2', 'e3', 'e4']
        }
    },
    {
        path: '/notice/add',
        name: 'notice_add',
        component: () => import('@/views/pages/notice/NoticeAdd.vue'),
        meta: {
            roles: ['e2', 'e3', 'e4']
        }
    },
    {
        path: '/notice/edit/:noticeNo',
        name: 'notice_edit',
        component: () => import('@/views/pages/notice/NoticeEdit.vue'),
        meta: {
            roles: ['e2', 'e3', 'e4']
        }
    }
];
