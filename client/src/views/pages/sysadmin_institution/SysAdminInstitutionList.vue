<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getInstitutionList, deleteInstitutions } from '@/service/SysAdminInstitutionService';

const router = useRouter();

/* =========================
   기본 상태
========================= */
const institutionList = ref([]);
const keyword = ref('');
const selectedInstitutions = ref([]);

// DataTable 페이지 상태
const rows = ref(10);
const first = ref(0);

/* =========================
   현재 페이지 목록
========================= */
const currentPageInstitutions = computed(() => {
    return institutionList.value.slice(first.value, first.value + rows.value);
});

/* =========================
   기관 전체조회 / 검색조회
========================= */
const loadInstitutionList = async () => {
    try {
        const result = await getInstitutionList(keyword.value);

        if (result.retCode === 'OK') {
            institutionList.value = result.data || [];
        } else {
            alert(result.message || '기관 목록 조회 실패');
        }
    } catch (err) {
        console.error('기관 목록 조회 실패:', err);
        alert('기관 목록을 불러오지 못했습니다.');
    }
};

const searchInstitution = () => {
    loadInstitutionList();
};

const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
        loadInstitutionList();
    }
};

const resetSearch = async () => {
    keyword.value = '';
    selectedInstitutions.value = [];
    first.value = 0;
    await loadInstitutionList();
};

/* =========================
   현재 페이지 미운영 전체선택
========================= */
const selectClosedInstitutionsOnPage = () => {
    const closedInstitutions = currentPageInstitutions.value.filter((item) => Number(item.operation) === 0);

    selectedInstitutions.value = closedInstitutions;
};

/* =========================
   선택 해제
========================= */
const clearSelectedInstitutions = () => {
    selectedInstitutions.value = [];
};

/* =========================
   기관 선택삭제
========================= */
const deleteSelectedInstitutionList = async () => {
    try {
        if (!selectedInstitutions.value.length) {
            alert('선택된 기관이 없습니다.');
            return;
        }

        const hasOperatingInstitution = selectedInstitutions.value.some((item) => Number(item.operation) === 1);

        if (hasOperatingInstitution) {
            alert('운영중인 기관은 삭제할 수 없습니다. 종료된 기관만 삭제 가능합니다.');
            return;
        }

        const institutionNos = selectedInstitutions.value.map((item) => item.institution_no);

        const isConfirmed = confirm('선택한 기관을 삭제하시겠습니까?');
        if (!isConfirmed) return;

        const result = await deleteInstitutions(institutionNos);

        if (result.retCode === 'OK') {
            alert('삭제되었습니다.');
            selectedInstitutions.value = [];
            await loadInstitutionList();
        } else {
            alert(result.message || '기관 삭제 실패');
        }
    } catch (err) {
        console.error('기관 삭제 실패:', err);
        alert('기관 삭제 중 오류가 발생했습니다.');
    }
};

/* =========================
   상세조회 페이지 이동
========================= */
const openDetail = (institutionNo) => {
    router.push(`/sysadmin/institutions/${institutionNo}`);
};

/* =========================
   수정 페이지 이동
========================= */
const goEdit = (institutionNo) => {
    router.push(`/sysadmin/institutions/${institutionNo}/edit`);
};

/* =========================
   등록 페이지 이동
========================= */
const goCreate = () => {
    router.push('/sysadmin/institutions/create');
};

onMounted(() => {
    loadInstitutionList();
});
</script>

<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <!-- 제목/설명 -->
                <div class="mb-5">
                    <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">기관 정보</div>
                    <span class="text-muted-color">시스템관리자가 기관 목록을 조회할 수 있습니다.</span>
                </div>

                <!-- 테이블 위 툴바 -->
                <div class="flex justify-between items-center mb-3">
                    <div class="flex gap-2">
                        <Button label="미운영 전체선택" severity="secondary" outlined @click="selectClosedInstitutionsOnPage" />
                        <Button label="선택해제" severity="secondary" outlined @click="clearSelectedInstitutions" />
                    </div>

                    <div class="flex gap-2 items-center">
                        <InputText v-model="keyword" placeholder="기관번호 / 기관명 검색" class="w-72" @keydown="handleSearchEnter" />
                        <Button icon="pi pi-search" @click="searchInstitution" />
                        <Button icon="pi pi-refresh" severity="secondary" outlined @click="resetSearch" />
                    </div>
                </div>

                <DataTable
                    v-model:selection="selectedInstitutions"
                    :value="institutionList"
                    dataKey="institution_no"
                    class="w-full institution-table"
                    paginator
                    :rows="rows"
                    :first="first"
                    :totalRecords="institutionList.length"
                    @page="
                        (event) => {
                            first = event.first;
                            rows = event.rows;
                        }
                    "
                    @row-click="(event) => openDetail(event.data.institution_no)"
                >
                    <!-- 개별 선택 체크박스 -->
                    <Column selectionMode="multiple" headerStyle="width: 3rem" :exportable="false">
                        <template #header>
                            <div></div>
                        </template>
                    </Column>

                    <!-- 기관번호 -->
                    <Column field="institution_no">
                        <template #header>
                            <div class="w-full text-center font-bold">기관번호</div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.institution_no }}
                        </template>
                    </Column>

                    <!-- 기관명 -->
                    <Column field="name">
                        <template #header>
                            <div class="w-full text-center font-bold">기관명</div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.name || '-' }}
                        </template>
                    </Column>

                    <!-- 연락처 -->
                    <Column field="tel">
                        <template #header>
                            <div class="w-full text-center font-bold">연락처</div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.tel || '-' }}
                        </template>
                    </Column>

                    <!-- 이메일 -->
                    <Column field="institution_email">
                        <template #header>
                            <div class="w-full text-center font-bold">이메일</div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.institution_email || '-' }}
                        </template>
                    </Column>

                    <!-- 가입일 -->
                    <Column field="created_at">
                        <template #header>
                            <div class="w-full text-center font-bold">가입일</div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.created_at || '-' }}
                        </template>
                    </Column>

                    <!-- 운영여부 -->
                    <Column>
                        <template #header>
                            <div class="w-full text-center font-bold">운영여부</div>
                        </template>
                        <template #body="slotProps">
                            <Tag :value="Number(slotProps.data.operation) === 1 ? '운영' : '종료'" :severity="Number(slotProps.data.operation) === 1 ? null : 'secondary'" rounded />
                        </template>
                    </Column>

                    <!-- 수정 -->
                    <Column>
                        <template #header>
                            <div class="w-full text-center font-bold">수정</div>
                        </template>
                        <template #body="slotProps">
                            <Button label="수정" size="small" @click.stop="goEdit(slotProps.data.institution_no)" />
                        </template>
                    </Column>

                    <template #empty>
                        <div class="py-6 text-center text-muted-color">조회된 기관이 없습니다.</div>
                    </template>
                </DataTable>

                <div class="flex justify-between mt-4">
                    <div></div>
                    <div class="flex gap-2">
                        <Button label="기관 등록" @click="goCreate" />
                        <Button label="삭제" severity="danger" :disabled="selectedInstitutions.length === 0" @click="deleteSelectedInstitutionList" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* =========================
   본문 셀 기본 정렬
========================= */
:deep(.institution-table .p-datatable-tbody > tr > td) {
    text-align: center;
    vertical-align: middle;
    padding: 0.9rem 0.75rem;
    border-bottom: 1px solid var(--p-content-border-color);
}

/* =========================
   행 hover 효과
========================= */
:deep(.institution-table .p-datatable-tbody > tr) {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

:deep(.institution-table .p-datatable-tbody > tr:hover > td) {
    background-color: var(--p-surface-100);
}

/* =========================
   페이지네이터 중앙 정렬
========================= */
:deep(.institution-table .p-paginator) {
    justify-content: center;
}

/* 체크박스 컬럼 헤더의 전체선택 체크박스 숨김 */
:deep(.institution-table .p-datatable-thead > tr > th:first-child .p-checkbox) {
    display: none;
}
:deep(.institution-table .p-datatable-thead > tr > th:first-child) {
    text-align: center;
}
</style>
