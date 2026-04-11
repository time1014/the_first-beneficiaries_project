<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';

/* =========================
   props / 상태
========================= */
// 부모 컴포넌트에서 지원계획 번호를 props로 받음
// 예: <PlanFileList :support-plan-no="plan.support_plan_no" />
const props = defineProps({
    supportPlanNo: Number
});

// 서버에서 조회한 첨부파일 목록을 저장할 변수
const fileList = ref([]);

/* =========================
   첨부파일 목록 조회
========================= */
// 현재 지원계획 번호(supportPlanNo)에 연결된 첨부파일 목록을 조회
const loadFiles = async () => {
    try {
        // 지원계획 번호가 없으면 조회할 수 없으므로 빈 배열 처리
        if (!props.supportPlanNo) {
            fileList.value = [];
            return;
        }

        // 서버에 첨부파일 목록 요청
        const resp = await fetch(`/api/plan/${props.supportPlanNo}/files`);

        // 응답을 text로 받고, 값이 있으면 JSON으로 변환
        const text = await resp.text();
        const data = text ? JSON.parse(text) : [];

        // 정상 응답이면 파일 목록 저장
        if (resp.ok) {
            fileList.value = Array.isArray(data) ? data : [];
        } else {
            // 실패하면 빈 배열 처리
            fileList.value = [];
            console.error('지원계획 첨부파일 목록 조회 실패:', data.message);
        }
    } catch (err) {
        console.error('지원계획 첨부파일 목록 조회 에러:', err);
        fileList.value = [];
    }
};

/* =========================
   첨부파일 목록 자동 새로고침 이벤트
========================= */
// PlanForm.vue에서 등록/수정/삭제 후 발생시키는 이벤트를 받으면 첨부파일 목록 재조회
const handlePlanFileRefresh = async () => {
    await loadFiles();
};

/* =========================
   파일 다운로드
========================= */
// 파일명을 클릭하면 다운로드 라우터 호출
const downloadFile = (fileNo) => {
    window.open(`/api/plan/file/download/${fileNo}`, '_blank');
};

/* =========================
   라이프사이클
========================= */
// 컴포넌트가 처음 열릴 때 첨부파일 목록 조회
onMounted(() => {
    loadFiles();

    // 지원계획 목록 새로고침 이벤트를 같이 받아서 파일 목록도 다시 조회
    window.addEventListener('plan-list-refresh', handlePlanFileRefresh);
});

// 부모에서 supportPlanNo가 바뀌면 다시 조회
watch(
    () => props.supportPlanNo,
    async (newValue, oldValue) => {
        if (newValue !== oldValue) {
            await loadFiles();
        }
    }
);

// 컴포넌트가 사라질 때 이벤트 제거
onBeforeUnmount(() => {
    window.removeEventListener('plan-list-refresh', handlePlanFileRefresh);
});
</script>

<template>
    <div class="mt-2">
        <!-- 첨부파일이 없을 때 -->
        <div v-if="fileList.length === 0" class="text-sm text-gray-500">첨부파일 없음</div>

        <!-- 첨부파일이 있을 때 -->
        <ul v-else class="space-y-1">
            <li v-for="file in fileList" :key="file.file_no">
                <!-- 파일명을 누르면 다운로드 -->
                <button type="button" @click="downloadFile(file.file_no)" class="text-blue-600 hover:underline text-sm">
                    {{ file.file_name }}
                </button>
            </li>
        </ul>
    </div>
</template>
