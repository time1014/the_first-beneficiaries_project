<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';

/* =========================
   props / 상태
========================= */
// 부모 컴포넌트에서 지원결과 번호를 props로 받음
// 예: <ResultFileList :support-result-no="item.support_result_no" />
const props = defineProps({
    supportResultNo: Number
});

// 서버에서 조회한 첨부파일 목록 저장
const fileList = ref([]);

/* =========================
   첨부파일 목록 조회
========================= */
// 현재 지원결과 번호(supportResultNo)에 연결된 첨부파일 목록 조회
const loadFiles = async () => {
    try {
        if (!props.supportResultNo) {
            fileList.value = [];
            return;
        }

        const resp = await fetch(`/api/result/${props.supportResultNo}/files`);

        if (!resp.ok) {
            fileList.value = [];
            console.error('지원결과 첨부파일 목록 조회 실패:', resp.status);
            return;
        }

        const data = await resp.json();
        fileList.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('지원결과 첨부파일 목록 조회 에러:', err);
        fileList.value = [];
    }
};

/* =========================
   파일 다운로드
========================= */
// 파일명을 클릭하면 다운로드 라우터 호출
const downloadFile = (fileNo) => {
    window.open(`/api/result/file/download/${fileNo}`, '_blank');
};

/* =========================
   자동 새로고침 이벤트
========================= */
// ResultForm.vue에서 저장/수정 후 발생시키는 이벤트를 받으면 첨부파일 목록 재조회
const handleResultFileRefresh = async () => {
    await loadFiles();
};

/* =========================
   라이프사이클
========================= */
onMounted(() => {
    loadFiles();
    window.addEventListener('result-list-refresh', handleResultFileRefresh);
});

onBeforeUnmount(() => {
    window.removeEventListener('result-list-refresh', handleResultFileRefresh);
});

// 부모에서 supportResultNo가 바뀌면 다시 조회
watch(
    () => props.supportResultNo,
    async () => {
        await loadFiles();
    }
);
</script>

<template>
    <div class="mt-2">
        <!-- 첨부파일이 없을 때 -->
        <div v-if="fileList.length === 0" class="text-sm text-gray-500">첨부파일 없음</div>

        <!-- 첨부파일이 있을 때 -->
        <ul v-else class="space-y-1">
            <li v-for="file in fileList" :key="file.file_no">
                <button type="button" @click="downloadFile(file.file_no)" class="text-blue-600 hover:underline text-sm">
                    {{ file.file_name }}
                </button>
            </li>
        </ul>
    </div>
</template>
