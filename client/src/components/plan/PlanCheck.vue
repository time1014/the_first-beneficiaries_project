<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import PlanFileList from '@/components/plan/PlanFileList.vue';

/* =========================
    기본 상태
========================= */
// 현재 라우트에서 survey 번호를 가져옴
const route = useRoute();
const surveyNo = Number(route.params.no);

// 지원계획 목록 저장용 변수
const list = ref([]);

/* =========================
    공통 함수
========================= */
// localStorage에 저장된 로그인 사용자 정보 가져오기
const getLoginUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const loginUser = getLoginUser();
const loginRole = loginUser?.role;

/* =========================
    버튼 표시 조건 함수
========================= */
// 수정 버튼 표시 조건
// - 기관담당자(e2)만 표시
// - 검토중(a0)인 계획서만 표시
const canShowEditButton = (item) => {
    return loginRole === 'e2' && item.approval === 'a0';
};

// 삭제 버튼 표시 조건
// - 기관담당자(e2)만 표시
// - 검토중(a0)인 계획서만 표시
// - 작성자 본인일 때만 표시
const canShowDeleteButton = (item) => {
    return loginRole === 'e2' && item.approval === 'a0' && Number(item.writer_no) === Number(loginUser?.user_no);
};

/* =========================
    지원계획 목록 조회
========================= */
// 현재 surveyNo에 해당하는 지원계획 목록을 서버에서 가져옴
// 기관관리자(e3)는 관리자 전용 목록 API 사용
// 기관담당자(e2)는 일반 목록 API 사용
const loadPlanList = async () => {
    try {
        const loginUser = getLoginUser();
        const loginRole = loginUser?.role;

        const url = loginRole === 'e3' ? `/api/plan/admin/list/${surveyNo}` : `/api/plan/${surveyNo}`;

        const resp = await fetch(url);
        const text = await resp.text();
        const data = text ? JSON.parse(text) : [];

        list.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('지원계획 조회 에러:', err);
        list.value = [];
    }
};

/* =========================
    목록 자동 새로고침 이벤트
========================= */
// PlanForm.vue에서 수정/삭제/저장 후 발생시키는 이벤트를 받으면 목록 재조회
const handlePlanListRefresh = async () => {
    await loadPlanList();
};

/* =========================
    지원계획 수정
========================= */
// 수정 버튼 클릭 시 수정용 상세 데이터 조회 후 PlanForm으로 전달
const editPlan = async (supportPlanNo) => {
    try {
        const loginUser = getLoginUser();
        const loginUserNo = loginUser?.user_no;

        if (!loginUserNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const ok = window.confirm('이 지원계획을 수정하시겠습니까?');
        if (!ok) {
            return;
        }

        const resp = await fetch(`/api/plan/detail/${supportPlanNo}/${loginUserNo}`);
        const text = await resp.text();
        const data = text ? JSON.parse(text) : {};

        if (!resp.ok) {
            alert(data.message || '수정할 지원계획 정보를 불러오지 못했습니다.');
            return;
        }

        // PlanForm.vue에서 받을 수 있도록 window 커스텀 이벤트 발생
        window.dispatchEvent(
            new CustomEvent('plan-edit-mode', {
                detail: data
            })
        );

        alert('오른쪽 입력폼에 수정할 내용이 불러와졌습니다.');
    } catch (err) {
        console.error('지원계획 수정 데이터 조회 에러:', err);
        alert('수정할 데이터를 불러오는 중 오류가 발생했습니다.');
    }
};

/* =========================
    지원계획 삭제
========================= */
// 검토중(a0)인 계획서 중 작성자 본인만 삭제 가능
const deletePlan = async (supportPlanNo) => {
    try {
        const loginUser = getLoginUser();
        const writerNo = loginUser?.user_no;

        if (!writerNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const ok = window.confirm('이 지원계획을 삭제하시겠습니까?');
        if (!ok) {
            return;
        }

        const resp = await fetch(`/api/plan/${supportPlanNo}/${writerNo}`, {
            method: 'DELETE'
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : {};

        if (resp.ok) {
            alert(data.message || '지원계획이 삭제되었습니다.');
            await loadPlanList();
        } else {
            alert(data.message || '지원계획 삭제에 실패했습니다.');
        }
    } catch (err) {
        console.error('지원계획 삭제 에러:', err);
        alert('지원계획 삭제 중 오류가 발생했습니다.');
    }
};

/* =========================
    관리자용 계획서 선택
========================= */
// 관리자 로그인 상태에서는 왼쪽 조회창에서 계획서를 클릭하면
// 오른쪽 승인/반려 처리폼으로 선택한 계획서 정보를 전달
const selectPlanForAdmin = (item) => {
    if (loginRole !== 'e3') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent('admin-plan-select', {
            detail: item
        })
    );
};
/* =========================
   수정이력 모달 상태
========================= */
const historyDialog = ref(false);
const historyData = ref([]);
const historyDialogTitle = ref('지원계획 수정이력');

/* =========================
   지원계획 수정이력 조회
========================= */
// 계획서 번호 기준 수정이력 조회 후 모달 열기
const openPlanHistory = async (item) => {
    try {
        const resp = await fetch(`/api/plan/history/${item.support_plan_no}`);
        const text = await resp.text();
        const data = text ? JSON.parse(text) : [];

        if (!resp.ok) {
            alert(data.message || '수정이력 조회에 실패했습니다.');
            return;
        }

        historyData.value = Array.isArray(data) ? data : [];
        historyDialogTitle.value = `지원계획 ${item.support_plan_no} 수정이력`;
        historyDialog.value = true;
    } catch (err) {
        console.error('지원계획 수정이력 조회 에러:', err);
        alert('수정이력 조회 중 오류가 발생했습니다.');
    }
};
// 화면이 열릴 때 목록 조회
onBeforeMount(() => {
    loadPlanList();
});

onMounted(() => {
    window.addEventListener('plan-list-refresh', handlePlanListRefresh);
});

onBeforeUnmount(() => {
    window.removeEventListener('plan-list-refresh', handlePlanListRefresh);
});
</script>

<template>
    <!-- 조회영역 전체 -->
    <div class="card md:h-12/19 flex flex-col gap-4 min-h-0">
        <!-- 화면 제목 -->
        <div class="font-bold text-lg mb-2 border-b pb-2">지원계획 조회</div>

        <!-- 스크롤 영역 -->
        <div class="max-h-[400px] overflow-y-auto pr-2">
            <!-- 데이터 없을 때 -->
            <div v-if="list.length === 0" class="text-center text-gray-500 py-10">등록된 지원계획이 없습니다.</div>

            <!-- 데이터 있을 때 -->
            <div v-else>
                <!-- 지원계획 목록 반복 출력 -->
                <div v-for="(item, index) in list" :key="item.support_plan_no || index" class="mb-6 border-b pb-4" :class="{ 'cursor-pointer hover:bg-blue-50/50 transition-colors': loginRole === 'e3' }" @click="selectPlanForAdmin(item)">
                    <!-- =========================
                            상단 정보
                    ========================== -->
                    <div class="flex justify-between items-center mb-2">
                        <div class="font-semibold flex items-center gap-2">
                            <!-- 승인상태 -->
                            <span
                                class="text-xs px-2 py-0.5 rounded shadow-sm"
                                :class="{
                                    'bg-yellow-100 text-yellow-700': item.approval === 'a0',
                                    'bg-green-100 text-green-700': item.approval === 'a1',
                                    'bg-red-100 text-red-700': item.approval === 'a2'
                                }"
                            >
                                {{ item.approval_name }}
                            </span>

                            <!-- 지원계획 번호 -->
                            <span>지원계획 {{ item.support_plan_no }}</span>
                        </div>

                        <!-- 작성자 / 작성일 -->
                        <div class="text-sm text-gray-600">작성자 {{ item.name }} &nbsp; 작성일 {{ item.created_at }}</div>
                    </div>

                    <!-- =========================
                            제목
                    ========================== -->
                    <div class="border-t border-b py-2 mb-2">
                        <span class="mr-2 font-medium">제목</span>
                        <span>{{ item.title }}</span>
                    </div>

                    <!-- =========================
                            내용
                    ========================== -->
                    <div class="border-b py-2 mb-2">
                        <div class="flex">
                            <span class="mr-2 font-medium whitespace-nowrap">내용</span>
                            <span class="text-gray-700">{{ item.content }}</span>
                        </div>
                    </div>

                    <!-- =========================
                            첨부파일
                    ========================== -->
                    <div class="border-b py-2 mb-2">
                        <span class="mr-2 font-medium block mb-1">첨부파일</span>

                        <!-- support_plan_no 기준으로 파일 목록 조회/다운로드 -->
                        <PlanFileList :support-plan-no="item.support_plan_no" />
                    </div>

                    <!-- =========================
                            반려사유
                    ========================== -->
                    <div v-if="item.approval === 'a2'" class="py-2 mb-2 bg-red-50 px-2 rounded">
                        <span class="mr-2 font-medium text-red-600 font-bold">반려사유</span>
                        <span class="text-red-700">{{ item.rejection_reason }}</span>
                    </div>

                    <!-- =========================
                            수정이력 / 수정 / 삭제 버튼
                        ========================= -->
                    <div class="mt-4 flex justify-end gap-2">
                        <!-- 수정이력 버튼 -->
                        <Button type="button" label="수정이력" class="w-24 p-button-sm" @click.stop="openPlanHistory(item)" />

                        <!-- 수정 버튼 -->
                        <Button v-if="canShowEditButton(item)" type="button" label="수정" class="w-24 p-button-sm" @click.stop="editPlan(item.support_plan_no)" />

                        <!-- 삭제 버튼 -->
                        <Button v-if="canShowDeleteButton(item)" type="button" label="삭제" class="w-24 p-button-sm" severity="danger" @click.stop="deletePlan(item.support_plan_no)" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="historyDialog" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '50vw' }">
        <template #header>
            <div class="w-full bg-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                <span class="text-lg font-medium">
                    {{ historyDialogTitle }}
                </span>

                <button @click="historyDialog = false" class="text-white text-2xl font-light hover:opacity-70">✕</button>
            </div>
        </template>

        <div v-if="historyData.length === 0" class="text-center py-10 text-gray-400">수정이력 없음</div>

        <div v-else class="px-4 py-6">
            <table class="w-full text-center border-collapse">
                <thead>
                    <tr class="border-t-2 border-b-2 border-gray-400">
                        <th class="py-3">수정날짜</th>
                        <th class="py-3">작성자</th>
                        <th class="py-3">권한</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="item in historyData" :key="item.history_no || item.created_at" class="border-b border-gray-400 h-12 hover:bg-gray-50">
                        <td>{{ item.created_at }}</td>
                        <td>{{ item.writer }}</td>
                        <td>{{ item.role }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Dialog>
</template>
