<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const notice = ref([]);
const keyword = ref('');

// 모든 항목(제목, 내용, 작성자, 날짜)을 포함하여 필터링
const filteredNotice = computed(() => {
    const trimmedKeyword = keyword.value.trim().toLowerCase();
    if (!trimmedKeyword) return notice.value;

    return notice.value.filter((item) => {
        const title = (item.notice_title || '').toLowerCase();
        const content = (item.notice_content || '').toLowerCase();
        const userName = (item.user_name || '').toLowerCase();
        const date = dateFormat(item.created_at).toLowerCase();

        return title.includes(trimmedKeyword) || content.includes(trimmedKeyword) || userName.includes(trimmedKeyword) || date.includes(trimmedKeyword);
    });
});

// 날짜포맷
const dateFormat = (dateVal) => {
    let newDate = new Date(dateVal);
    let year = newDate.getFullYear();
    let month = ('0' + (newDate.getMonth() + 1)).slice(-2);
    let day = ('0' + newDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
};

// 공지사항 전체조회
const findAllNotice = async () => {
    try {
        const role = userStore.role;
        const insNo = userStore.institution;

        let url = '';

        // 검색어가 있으면 query string으로 붙여서 DB 검색
        const searchQuery = keyword.value.trim() ? `?keyword=${encodeURIComponent(keyword.value.trim())}` : '';

        // 시스템관리자 : 전체 공지 조회
        if (role === 'e4') {
            url = `/api/notice${searchQuery}`;
        } else {
            // 일반이용자/기관담당자/기관관리자 : 본인 기관 공지만 조회
            url = `/api/notice/${insNo}${searchQuery}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        notice.value = list.map((item) => ({
            ...item,
            create_at_formatted: dateFormat(item.created_at)
        }));
    } catch (err) {
        console.error(err);
    }
};

// 검색 실행
const searchNotice = () => {
    findAllNotice();
};

// 엔터 검색
const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
        findAllNotice();
    }
};

// 검색 초기화
const resetSearch = async () => {
    keyword.value = '';
    await findAllNotice();
};

// 검색어가 입력된 상태라면 내용을 표시
const shouldShowContent = (row) => {
    const trimmedKeyword = keyword.value.trim();
    return trimmedKeyword.length > 0;
};

// 공지사항 등록 권한 체크
const canManageNotice = computed(() => {
    return ['e2', 'e3', 'e4'].includes(userStore.role);
});

// 공지사항 등록으로 이동
const goToWriteForm = () => {
    router.push({
        path: '/notice/add'
    });
};

// 검색어 하이라이트 처리 함수
const highlightText = (text) => {
    const trimmedKeyword = keyword.value.trim();
    if (!trimmedKeyword || !text) return text;

    // 대소문자 구분 없이 검색어를 찾기 위한 정규식
    const regex = new RegExp(`(${trimmedKeyword})`, 'gi');
    return text.replace(regex, '<mark class="search-match">$1</mark>');
};

onBeforeMount(() => {
    findAllNotice();
});
</script>
<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <div class="flex justify-between items-center mb-3">
                    <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium">공지사항</div>

                    <div class="flex gap-2">
                        <InputText v-model="keyword" placeholder="제목 / 내용 / 작성자 / 작성일자 검색" class="w-72" @keydown="handleSearchEnter" />
                        <Button icon="pi pi-search" @click="searchNotice" />
                        <Button icon="pi pi-refresh" severity="secondary" outlined @click="resetSearch" />
                    </div>
                </div>
                <DataTable
                    :value="filteredNotice"
                    class="w-full"
                    :pt="{
                        headerRow: { class: 'text-center' },
                        column: {
                            headerContent: { class: 'justify-center' },
                            bodyCell: { class: 'text-center' }
                        }
                    }"
                    paginator
                    :rows="10"
                    scrollable
                    scrollHeight="600px"
                >
                    <Column header="번호" class="w-16 text-center">
                        <template #body="slotProps">
                            <div class="text-center">{{ slotProps.index + 1 }}</div>
                        </template>
                    </Column>
                    <Column header="제목" class="flex-1">
                        <template #body="slotProps">
                            <div class="text-left py-1" style="max-width: 1px; min-width: 100%">
                                <div class="mb-1 truncate">
                                    <span class="cursor-pointer hover:underline text-900 font-medium" @click="router.push(`/notice/info/${slotProps.data.notice_no}`)" v-html="highlightText(slotProps.data.notice_title)"> </span>
                                </div>
                                <div v-if="shouldShowContent(slotProps.data)" class="text-sm text-500 truncate" v-html="highlightText(slotProps.data.notice_content)"></div>
                            </div>
                        </template>
                    </Column>
                    <Column v-if="userStore.role === 'e4'" header="기관" class="w-56 text-center whitespace-nowrap">
                        <template #body="slotProps">
                        <div v-html="highlightText(slotProps.data.name || slotProps.data.institution_nm || '-')"></div>
                        </template>
                    </Column>
                    <Column header="작성자" class="w-40 text-center whitespace-nowrap">
                        <template #body="slotProps">
                            <div v-html="highlightText(slotProps.data.user_name)"></div>
                        </template>
                    </Column>
                    <Column header="작성일자" class="w-48 text-center whitespace-nowrap">
                        <template #body="slotProps">
                            <div v-html="highlightText(dateFormat(slotProps.data.created_at))"></div>
                        </template>
                    </Column>
                </DataTable>
                <div class="flex justify-end mt-4">
                    <Button v-if="canManageNotice" label="글등록" @click="goToWriteForm" />
                </div>
            </div>
        </div>
    </div>
</template>
