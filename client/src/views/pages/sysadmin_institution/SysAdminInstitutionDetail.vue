<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getInstitutionDetail } from '@/service/SysAdminInstitutionService';

const route = useRoute();
const router = useRouter();

/* =========================
   기본 상태
========================= */
// 현재 라우트에서 기관번호 가져오기
const institutionNo = computed(() => Number(route.params.institutionNo));

// 상세정보 저장
const detail = ref(null);

// 로딩 상태
const loading = ref(false);

/* =========================
   공통 함수
========================= */
// 날짜 표시용 함수
const formatDate = (value) => {
    if (!value) return '-';
    return String(value).slice(0, 10);
};

/* =========================
   기관 상세조회
========================= */
// 기관번호 기준으로 상세정보 조회
const loadInstitutionDetail = async () => {
    loading.value = true;

    try {
        const result = await getInstitutionDetail(institutionNo.value);

        if (result.retCode === 'OK' && result.data) {
            const data = result.data;

            detail.value = {
                institution_no: data.institution_no ?? '',
                name: data.name ?? '',
                business_number: data.business_number ?? '',
                tel: data.tel ?? '',
                institution_email: data.institution_email ?? '',
                institution_address: data.institution_address ?? '',
                created_at: data.created_at ?? '',
                operation: Number(data.operation ?? 1)
            };
        } else {
            detail.value = null;
            alert(result.message || '기관 상세 조회 실패');
        }
    } catch (err) {
        console.error('기관 상세 조회 실패:', err);
        detail.value = null;
        alert('기관 상세정보를 불러오지 못했습니다.');
    } finally {
        loading.value = false;
    }
};

/* =========================
   목록 페이지 이동
========================= */
// 목록으로 버튼 클릭 시 목록 페이지로 이동
const goList = () => {
    router.push('/sysadmin/institutions');
};

/* =========================
   수정 페이지 이동
========================= */
// 수정 버튼 클릭 시 수정 페이지로 이동
const goEdit = () => {
    router.push(`/sysadmin/institutions/${institutionNo.value}/edit`);
};

onMounted(() => {
    loadInstitutionDetail();
});
</script>

<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <!-- =========================
             화면 제목
        ========================== -->
                <div class="mb-5">
                    <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">기관 상세정보</div>
                    <span class="text-muted-color">시스템관리자가 기관 상세정보를 확인할 수 있습니다.</span>
                </div>

                <!-- =========================
             로딩 안내
        ========================== -->
                <div v-if="loading" class="text-muted-color">기관 정보를 불러오는 중입니다.</div>

                <!-- =========================
             상세조회 내용
        ========================== -->
                <div v-else-if="detail" class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                    <table class="w-full border-collapse">
                        <tbody>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center w-40">기관번호</th>
                                <td class="py-3 px-4">{{ detail.institution_no || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">기관명</th>
                                <td class="py-3 px-4">{{ detail.name || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">사업자번호</th>
                                <td class="py-3 px-4">{{ detail.business_number || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">연락처</th>
                                <td class="py-3 px-4">{{ detail.tel || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">이메일</th>
                                <td class="py-3 px-4">{{ detail.institution_email || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">주소</th>
                                <td class="py-3 px-4">{{ detail.institution_address || '-' }}</td>
                            </tr>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="py-3 text-center">가입일</th>
                                <td class="py-3 px-4">{{ formatDate(detail.created_at) }}</td>
                            </tr>
                            <tr>
                                <th class="py-3 text-center">운영여부</th>
                                <td class="py-3 px-4">
                                    <Tag :value="Number(detail.operation) === 1 ? '운영' : '종료'" :severity="Number(detail.operation) === 1 ? null : 'secondary'" rounded />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- =========================
                 버튼 영역
            ========================== -->
                    <div class="flex justify-end gap-2 mt-4">
                        <Button label="목록으로" severity="secondary" @click="goList" />
                        <Button label="수정" @click="goEdit" />
                    </div>
                </div>

                <!-- =========================
             데이터 없음 안내
        ========================== -->
                <div v-else class="text-muted-color">조회된 기관 정보가 없습니다.</div>
            </div>
        </div>
    </div>
</template>
