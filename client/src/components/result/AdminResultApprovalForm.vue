<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import ResultFileList from '@/components/result/ResultFileList.vue';

/* =========================
   기본 상태
========================= */
const route = useRoute();
const surveyNo = Number(route.params.no);

// 왼쪽 조회창에서 선택한 결과서 저장
const selectedResult = ref(null);

// 반려사유 입력값
const rejectionReason = ref('');

// 현재 선택된 결과서가 검토중인지 여부
const canProcess = computed(() => {
    return selectedResult.value && selectedResult.value.approval === 'a0';
});

/* =========================
   공통 함수
========================= */
// 관리자용 결과서 목록을 다시 조회해서
// 현재 선택된 결과서를 최신 상태로 다시 맞춤
const refreshSelectedResult = async (supportResultNo) => {
    try {
        const resp = await fetch(`/api/result/survey/${surveyNo}`);
        const text = await resp.text();
        const data = text ? JSON.parse(text) : [];

        if (!resp.ok) {
            return;
        }

        const list = Array.isArray(data) ? data : [];
        const found = list.find((item) => Number(item.support_result_no) === Number(supportResultNo));

        if (found) {
            selectedResult.value = found;
            rejectionReason.value = found.rejection_reason || '';
        }
    } catch (err) {
        console.error('현재 처리 대상 재조회 에러:', err);
    }
};

/* =========================
   선택 이벤트 수신
========================= */
// ResultCheck.vue에서 보낸 결과서 선택 이벤트를 받아 오른쪽 폼에 표시
const handleAdminResultSelect = (event) => {
    const item = event.detail;

    if (!item) {
        return;
    }

    // 이미 선택된 다른 결과서가 있고 반려사유 입력 중이면 확인창 표시
    if (selectedResult.value && selectedResult.value.support_result_no !== item.support_result_no && selectedResult.value.approval === 'a0' && rejectionReason.value.trim() !== '') {
        const ok = window.confirm('현재 입력 중인 반려사유가 있습니다. 다른 결과서를 선택하시겠습니까?');

        if (!ok) {
            return;
        }
    }

    selectedResult.value = item;
    rejectionReason.value = item.rejection_reason || '';
};

/* =========================
   승인 처리
========================= */
// 검토중(a0)인 결과서만 승인 처리
const approveResult = async () => {
    try {
        if (!selectedResult.value) {
            alert('왼쪽 조회창에서 처리할 지원결과를 먼저 선택해주세요.');
            return;
        }

        if (selectedResult.value.approval !== 'a0') {
            alert('검토중인 지원결과만 승인할 수 있습니다.');
            return;
        }

        const currentResultNo = selectedResult.value.support_result_no;

        const ok = window.confirm('이 지원결과를 승인하시겠습니까?');
        if (!ok) {
            return;
        }

        const resp = await fetch(`/api/result/admin/approve/${currentResultNo}`, {
            method: 'PUT'
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : {};

        if (resp.ok) {
            alert(data.message || '지원결과가 승인되었습니다.');

            window.dispatchEvent(new CustomEvent('result-list-refresh'));

            await refreshSelectedResult(currentResultNo);
            rejectionReason.value = selectedResult.value?.rejection_reason || '';
        } else {
            alert(data.message || '지원결과 승인에 실패했습니다.');
        }
    } catch (err) {
        console.error('지원결과 승인 에러:', err);
        alert('지원결과 승인 중 오류가 발생했습니다.');
    }
};

/* =========================
   반려 처리
========================= */
// 검토중(a0)인 결과서만 반려 처리
// 반려사유는 필수 입력
const rejectResult = async () => {
    try {
        if (!selectedResult.value) {
            alert('왼쪽 조회창에서 처리할 지원결과를 먼저 선택해주세요.');
            return;
        }

        if (selectedResult.value.approval !== 'a0') {
            alert('검토중인 지원결과만 반려할 수 있습니다.');
            return;
        }

        if (!rejectionReason.value.trim()) {
            alert('반려사유를 입력해주세요.');
            return;
        }

        const currentResultNo = selectedResult.value.support_result_no;

        const ok = window.confirm('이 지원결과를 반려하시겠습니까?');
        if (!ok) {
            return;
        }

        const resp = await fetch(`/api/result/admin/reject/${currentResultNo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rejection_reason: rejectionReason.value
            })
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : {};

        if (resp.ok) {
            alert(data.message || '지원결과가 반려되었습니다.');

            window.dispatchEvent(new CustomEvent('result-list-refresh'));

            await refreshSelectedResult(currentResultNo);
            rejectionReason.value = selectedResult.value?.rejection_reason || '';
        } else {
            alert(data.message || '지원결과 반려에 실패했습니다.');
        }
    } catch (err) {
        console.error('지원결과 반려 에러:', err);
        alert('지원결과 반려 중 오류가 발생했습니다.');
    }
};

/* =========================
   라이프사이클
========================= */
onMounted(() => {
    window.addEventListener('admin-result-select', handleAdminResultSelect);
});

onBeforeUnmount(() => {
    window.removeEventListener('admin-result-select', handleAdminResultSelect);
});
</script>

<template>
    <div class="p-6 bg-slate-100 card h-220">
        <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl h-full flex flex-col">
            <h2 class="text-lg font-bold mb-4 border-b pb-2 shrink-0">지원결과 결재</h2>

            <!-- 선택 전 안내 -->
            <div v-if="!selectedResult" class="border rounded-lg p-6 bg-gray-50 text-center text-gray-500">
                <div class="font-semibold mb-2">검토할 지원결과를 먼저 선택해주세요.</div>
                <div class="text-sm">왼쪽 조회창에서 지원결과를 선택하면 해당 정보가 이 영역에 표시됩니다.</div>
            </div>

            <!-- 선택 후 상세/처리 -->
            <template v-else>
                <!-- 본문 스크롤 영역 -->
                <div class="flex-1 min-h-0 overflow-y-auto pr-1">
                    <!-- 현재 처리 대상 -->
                    <div class="mb-4 border rounded-lg p-4 bg-blue-50">
                        <div class="font-semibold text-lg mb-4">현재 처리 대상</div>
                        <div class="font-semibold">지원결과 {{ selectedResult.support_result_no }}</div>
                        <div class="text-sm text-gray-500 mb-1">작성자 {{ selectedResult.name }} / 작성일 {{ selectedResult.created_at }}</div>
                    </div>

                    <!-- 상태 / 종결 여부 -->
                    <div class="mb-4 flex gap-2">
                        <span
                            class="text-xs px-2 py-1 rounded"
                            :class="{
                                'bg-yellow-100 text-yellow-700': selectedResult.approval === 'a0',
                                'bg-green-100 text-green-700': selectedResult.approval === 'a1',
                                'bg-red-100 text-red-700': selectedResult.approval === 'a2'
                            }"
                        >
                            {{ selectedResult.approval_name }}
                        </span>

                        <span class="text-xs px-2 py-1 rounded" :class="Number(selectedResult.finish) === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'">
                            {{ Number(selectedResult.finish) === 1 ? '종결' : '미종결' }}
                        </span>
                    </div>

                    <!-- 연결된 계획서 -->
                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">지원계획 번호</label>
                        <div class="w-full border rounded px-3 py-2 bg-gray-100">지원계획 {{ selectedResult.support_plan_no }}</div>
                    </div>

                    <!-- 제목 -->
                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">제목</label>
                        <div class="w-full border rounded px-3 py-2 bg-gray-100">
                            {{ selectedResult.title }}
                        </div>
                    </div>

                    <!-- 내용 -->
                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">내용</label>
                        <div class="w-full border rounded px-3 py-2 bg-gray-100 min-h-28 whitespace-pre-line">
                            {{ selectedResult.content }}
                        </div>
                    </div>

                    <!-- 첨부파일 -->
                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">첨부파일</label>
                        <div class="w-full border rounded px-3 py-2 bg-gray-100">
                            <ResultFileList :support-result-no="selectedResult.support_result_no" />
                        </div>
                    </div>

                    <!-- 반려사유 -->
                    <div class="mb-4">
                        <label class="block mb-1 text-sm font-medium">반려사유</label>
                        <textarea
                            v-model="rejectionReason"
                            :disabled="!canProcess"
                            class="w-full border rounded px-3 py-2 h-28"
                            :class="canProcess ? 'bg-gray-50' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
                            placeholder="반려 시 반려사유를 입력해주세요."
                        ></textarea>
                    </div>
                </div>

                <!-- 버튼 영역 -->
                <div class="shrink-0 pt-4 mt-4 border-t">
                    <div class="text-right flex justify-end gap-2">
                        <Button label="승인" type="button" @click="approveResult" :disabled="!canProcess" class="px-6 py-2 rounded-full text-white" :class="canProcess ? '' : 'bg-gray-300 cursor-not-allowed'" />

                        <Button type="button" label="반려" severity="danger" @click="rejectResult" :disabled="!canProcess" class="px-6 py-2 text-white" :class="canProcess ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'" />
                    </div>

                    <!-- 안내 -->
                    <p v-if="!canProcess" class="text-xs text-gray-500 text-right mt-2">검토중인 지원결과만 승인 또는 반려 처리할 수 있습니다.</p>
                </div>
            </template>
        </div>
    </div>
</template>
