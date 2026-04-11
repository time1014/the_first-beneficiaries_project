<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const notice = ref({
    notice_title: '',
    notice_content: '',
    user_no: '',
    user_name: '',
    created_at: '',
    files: []
});

const noticeData = ref([]);

// 공지사항 상세조회
const findNoticeByNo = async () => {
    try {
        const noticeNo = route.params.noticeNo;
        const res = await fetch(`/api/notice/detail/${noticeNo}`);
        const data = await res.json();

        noticeData.value = Array.isArray(data) ? data : [data];

        notice.value = {
            notice_title: data.notice_title || '',
            notice_content: data.notice_content || '',
            user_no: data.user_no || '',
            user_name: data.user_name || '',
            created_at: data.created_at || '',
            files: data.files || []
        };
    } catch (err) {
        console.log(err);
    }
};

// 날짜포맷
const dateFormat = (dateVal) => {
    let newDate = new Date(dateVal);
    let year = newDate.getFullYear();
    let month = ('0' + (newDate.getMonth() + 1)).slice(-2);
    let day = ('0' + newDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
};

// 목록
const goToList = () => {
    router.push('/notice');
};

// 공지사항 수정,삭제 권한 체크
const canManageNotice = computed(() => {
    return ['e2', 'e3', 'e4'].includes(userStore.role) && notice.value.user_no === userStore.user_no;
});

// 공지사항 수정으로 이동
const goToEditForm = () => {
    router.push(`/notice/edit/${route.params.noticeNo}`);
};

// 공지사항 삭제
const deleteNotice = async () => {
    const isConfirm = confirm('정말 삭제하시겠습니까?');
    if (!isConfirm) return;

    try {
        const noticeNo = route.params.noticeNo;

        const res = await fetch(`/api/notice/del/${noticeNo}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                user_no: userStore.user_no
            })
        });

        const data = await res.json();
        if (data.status) {
            alert('삭제되었습니다.');
            router.push('/notice');
        } else {
            alert(data.message || '삭제 권한이 없습니다.');
        }
    } catch (err) {
        console.log(err);
    }
};

// 첨부파일 다운로드 03/31 수정
const downloadFile = (fileNo) => {
    const downloadUrl = `/api/notice/file/${fileNo}`;
    window.location.href = downloadUrl;
};

onBeforeMount(() => {
    findNoticeByNo();
});
</script>
<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-6">공지사항</div>

                <div class="border rounded-lg p-6 bg-white shadow-sm">
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-1"></div>
                        <div class="text-xl font-semibold">{{ notice.notice_title }}</div>
                    </div>
                    <div class="flex gap-8 border-b pb-4 mb-6 text-sm text-gray-600">
                        <div>
                            <span class="font-medium">작성자 :</span>
                            {{ notice.user_name }}
                        </div>
                        <div>
                            <span class="font-medium">작성일 :</span>
                            {{ dateFormat(notice.created_at) }}
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="text-sm text-gray-500 mb-2"></div>
                        <div class="whitespace-pre-wrap leading-7 min-h-[200px]">
                            {{ notice.notice_content }}
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="text-sm text-gray-500 mb-2">첨부파일</div>

                        <div v-if="notice.files.length > 0" class="space-y-2">
                            <div v-for="file in notice.files" :key="file.file_no" class="border rounded px-3 py-2 text-sm cursor-pointer" @click="downloadFile(file.file_no)">
                                {{ file.file_name }}
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <Button label="목록" @click="goToList" />
                        <Button v-if="canManageNotice" label="글수정" @click="goToEditForm" />
                        <Button v-if="canManageNotice" label="글삭제" @click="deleteNotice" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
