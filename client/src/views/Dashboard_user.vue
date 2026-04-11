<script setup>
import { onBeforeMount, reactive, ref, computed } from 'vue';

import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import SurveyHistoryModal from '@/components/dialog/survey_dialog.vue';
import { FilterMatchMode } from '@primevue/core/api';

const router = useRouter();
const historyDialog = ref(false);
const userStore = useUserStore();
const user_no = userStore.user_no;
const selectedSurveyNo = ref(null);

const openHistoryModal = (surveyNo) => {
    selectedSurveyNo.value = surveyNo;
    historyDialog.value = true;
};

const planDialog = ref(false);
const resultDialog = ref(false);

const users = ref(null);
console.log(user_no);

// 지원계획 목록 저장용 변수
const planList = ref([]);
const resultList = ref([]);

const getLoginUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

//신청서 번호랑 대상자 번호 필요하면 담당자 번호도 넘겨서 해당 값들과 일치하는 계획 들고와서 모달안에 넣기
const planModalBtn = async (row) => {
    const surNo = row.survey_no;
    try {
        const loginUser = getLoginUser();
        const loginRole = loginUser?.role;

        const url = loginRole === 'e3' ? `/api/plan/admin/list/${surNo}` : `/api/plan/${surNo}`;

        const resp = await fetch(url);
        const text = await resp.text();
        const result = text ? JSON.parse(text) : [];

        planList.value = (Array.isArray(result) ? result : []).map((item) => ({
            ...item,
            files: item.filename ? item.filename.split(',') : []
        }));
    } catch (err) {
        console.error('지원계획 조회 에러:', err);
        planList.value = [];
    }
};

const filteredApprovalForm = computed(() => {
    return planList.value.filter((item) => item.approval === 'a1');
});

const loadResultList = async (row) => {
    const surNo = row.survey_no;
    try {
        const resp = await fetch(`/api/result/survey/${surNo}`);
        const text = await resp.text();
        const data = text ? JSON.parse(text) : [];

        resultList.value = (Array.isArray(data) ? data : [])
            .filter((item) => item.finish === 1) //종결건만 조회
            .map((item) => ({
                ...item,
                files: item.filename ? item.filename.split(',').map((f) => f.trim()) : []
            }));
    } catch (err) {
        console.error('지원결과 조회 에러:', err);
        resultList.value = [];
    }
};

const filteredApprovalForm_re = computed(() => {
    return resultList.value.filter((item) => item.approval === 'a1');
});

const findAllUsers = async () => {
    try {
        const resp = await fetch(`/api/lists/${user_no}`); // ❗ keyword 제거

        if (!resp.ok) throw new Error('Network response was not ok');

        const data = await resp.json();
        users.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('조회 에러:', err);
        users.value = [];
    }
};

onBeforeMount(() => {
    findAllUsers();
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// 검색 버튼 클릭 시 실행
const searchUsers = () => {
    // PrimeVue DataTable은 filters.global.value 값만 있어도 자동 필터링됨
    // 그래서 별도 fetch 없이 값 정리만 해주면 됨
    filters.value.global.value = filters.value.global.value?.trim() || '';
};

// 초기화 버튼 클릭 시 실행
const resetSearch = () => {
    filters.value.global.value = null;
};

// 엔터 누르면 검색되도록 처리
const handleSearchEnter = (event) => {
    if (event.key === 'Enter') {
        searchUsers();
    }
};
</script>

<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <div class="flex justify-between items-center mb-4">
                    <div class="font-semibold text-xl">지원신청내역</div>

                    <div class="flex gap-2">
                        <InputText v-model="filters.global.value" placeholder="지원자 / 보호자 / 담당자 검색" class="w-72" @keydown="handleSearchEnter" />
                        <Button icon="pi pi-search" @click="searchUsers" />
                        <Button icon="pi pi-refresh" severity="secondary" outlined @click="resetSearch" />
                    </div>
                </div>
                <DataTable :value="users" :filters="filters" filterDisplay="menu" :globalFilterFields="['beneficiaries_name', 'guardian_name', 'manager_name']" :paginator="true" :rows="10" dataKey="survey_no" :rowHover="true" showGridlines>
                    <!-- 못찾았을떄 -->
                    <template #empty> 검색 결과가 없습니다. </template>
                    <Column header="지원자명" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span>{{ data.beneficiaries_name }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="보호자명" style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.guardian_name }}
                        </template>
                    </Column>
                    <Column header="지원신청일" style="min-width: 10rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span>{{ data.created_at }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="지원신청서" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Button type="submit" label="보기" v-on:click="openHistoryModal(data.survey_no)" />
                            <SurveyHistoryModal v-model:visible="historyDialog" :surveyNo="selectedSurveyNo" />
                        </template>
                    </Column>
                    <Column header="담당자" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span>{{ data.manager_name }}</span>
                                <span v-if="data.manager_name == null">미지정</span>
                            </div>
                        </template>
                    </Column>

                    <Column header="우선순위" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span v-if="data.priority_id != null">
                                    {{ data.priority_name }}
                                </span>
                                <span v-else>미지정</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="계획/결과 진행" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span v-if="data.finish_cnt == 0">진행중 {{ data.progress_cnt }}건</span>
                                <span v-if="data.finish_cnt == 0">결과 {{ data.e1_result_cnt }}건</span>
                                <span v-if="data.finish_cnt > 0">종결 {{ data.finish_cnt }}건</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="지원계획" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <Button
                                    type="button"
                                    label="보기"
                                    @click="
                                        planModalBtn(data);
                                        planDialog = true;
                                    "
                                />
                            </div>
                        </template>
                    </Column>
                    <Column header="지원결과" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <Button
                                    type="button"
                                    label="보기"
                                    @click="
                                        loadResultList(data);
                                        resultDialog = true;
                                    "
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="planDialog" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '700px' }" :showHeader="false">
        <div class="rounded-xl overflow-hidden">
            <div class="bg-blue-500 text-white px-5 py-4 mt-7 flex justify-between items-center rounded-t-xl">
                <div class="text-lg font-semibold">지원계획</div>
                <button @click="planDialog = false" class="text-white text-xl hover:opacity-70 transition">✕</button>
            </div>

            <div class="max-h-[500px] overflow-y-auto p-4 bg-white">
                <div v-if="filteredApprovalForm.length === 0" class="text-center py-6 text-gray-400">데이터 없음</div>
                <div v-else class="flex flex-col gap-6">
                    <div v-for="(item, index) in filteredApprovalForm" :key="item.plan_no" class="border rounded-xl overflow-hidden bg-white shadow-sm">
                        <div class="flex justify-between items-center px-4 py-3 border-b">
                            <div class="font-semibold">계획 {{ String(index + 1).padStart(2, '0') }}</div>

                            <div
                                class="text-sm font-medium px-3 py-1 rounded-full"
                                :class="{
                                    'bg-green-100 text-green-700': item.approval_name === '승인',
                                    'bg-red-100 text-red-700': item.approval_name === '반려',
                                    'bg-gray-100 text-gray-600': !item.approval_name
                                }"
                            >
                                {{ item.approval_name || '미정' }}
                            </div>
                        </div>

                        <div class="divide-y">
                            <div class="grid grid-cols-4">
                                <div class="bg-gray-100 p-3 font-medium border-r">제목</div>
                                <div class="col-span-3 p-3">{{ item.title }}</div>
                            </div>

                            <div class="grid grid-cols-4">
                                <div class="bg-gray-100 p-3 font-medium border-r">내용</div>
                                <div class="col-span-3 p-3 whitespace-pre-line">
                                    {{ item.content }}
                                </div>
                            </div>

                            <div class="grid grid-cols-4" v-if="item.files.length">
                                <div class="bg-gray-100 p-3 font-medium border-r">첨부파일</div>

                                <div class="col-span-3 p-3">
                                    <div class="flex flex-col gap-1 w-full">
                                        <a v-for="file in item.files" :key="file" :href="`/api/download/${encodeURIComponent(file)}`" download class="block text-blue-600 hover:underline break-all w-full">
                                            {{ file }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="resultDialog" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '700px' }" :showHeader="false">
        <div class="rounded-xl overflow-hidden">
            <div class="bg-blue-500 text-white px-5 py-4 mt-7 flex justify-between items-center rounded-t-xl">
                <div class="text-lg font-semibold">지원결과</div>
                <button @click="resultDialog = false" class="text-white text-xl hover:opacity-70 transition">✕</button>
            </div>

            <div class="max-h-[500px] overflow-y-auto p-4 bg-white">
                <div v-if="filteredApprovalForm_re.length === 0" class="text-center py-6 text-gray-400">데이터 없음</div>

                <div v-else class="flex flex-col gap-6">
                    <div v-for="(item, index) in filteredApprovalForm_re" :key="item.result_no" class="border rounded-xl overflow-hidden bg-white shadow-sm">
                        <!-- 상단 -->
                        <div class="flex justify-between items-center px-4 py-3 border-b">
                            <div class="font-semibold">결과 {{ String(index + 1).padStart(2, '0') }}</div>

                            <!-- 결과 상태 (있으면 사용) -->
                            <div class="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                {{ item.status_name || '완료' }}
                            </div>
                        </div>

                        <!-- 내용 -->
                        <div class="divide-y">
                            <div class="grid grid-cols-4">
                                <div class="bg-gray-100 p-3 font-medium border-r">제목</div>
                                <div class="col-span-3 p-3">{{ item.title }}</div>
                            </div>

                            <div class="grid grid-cols-4">
                                <div class="bg-gray-100 p-3 font-medium border-r">내용</div>
                                <div class="col-span-3 p-3 whitespace-pre-line">
                                    {{ item.content }}
                                </div>
                            </div>

                            <!-- 파일 -->
                            <div class="grid grid-cols-4" v-if="item.files.length">
                                <div class="bg-gray-100 p-3 font-medium border-r">첨부파일</div>

                                <div class="col-span-3 p-3">
                                    <div class="flex flex-col gap-1 w-full">
                                        <a v-for="file in item.files" :key="file" :href="`/api/download/${encodeURIComponent(file)}`" download class="block text-blue-600 hover:underline break-all w-full"> 📎 {{ file }} </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>
<style scoped>
:deep(.search-match) {
    background-color: rgba(var(--primary-color-rgb), 0.15);
    color: var(--primary-color);
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 4px;
}
</style>
