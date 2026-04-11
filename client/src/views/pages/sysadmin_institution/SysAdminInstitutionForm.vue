<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getInstitutionDetail, createInstitution, updateInstitution } from '@/service/SysAdminInstitutionService';

const route = useRoute();
const router = useRouter();

/* =========================
   기본 상태
========================= */
// 수정 모드 여부
const isEditMode = computed(() => !!route.params.institutionNo);

// 수정 대상 기관번호
const institutionNo = computed(() => Number(route.params.institutionNo));

// 입력 폼 상태
const form = reactive({
    name: '',
    business_number: '',
    tel: '',
    zonecode: '',
    institution_address: '',
    detail_address: '',
    institution_email: '',
    operation: 1
});

/* =========================
   주소 문자열 합치기
========================= */
// 저장 시 우편번호 + 기본주소 + 상세주소를 하나의 문자열로 합침
function makeFinalAddress() {
    return [form.zonecode ? `(${form.zonecode})` : '', form.institution_address, form.detail_address].filter(Boolean).join(' ').trim();
}

/* =========================
   주소 문자열 분리
========================= */
// 수정 조회 시 저장된 주소 문자열을 다시 분리
function splitAddress(fullAddress) {
    if (!fullAddress) {
        form.zonecode = '';
        form.institution_address = '';
        form.detail_address = '';
        return;
    }

    const text = String(fullAddress).trim();
    const zoneMatch = text.match(/^\((\d{5})\)\s*/);

    if (zoneMatch) {
        form.zonecode = zoneMatch[1];
        form.institution_address = text.replace(/^\(\d{5}\)\s*/, '');
        form.detail_address = '';
    } else {
        form.zonecode = '';
        form.institution_address = text;
        form.detail_address = '';
    }
}

/* =========================
   카카오 주소 검색
========================= */
const searchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
        alert('주소 검색 서비스를 불러오지 못했습니다.');
        return;
    }

    new window.daum.Postcode({
        oncomplete: function (data) {
            form.zonecode = data.zonecode || '';
            form.institution_address = data.roadAddress || data.jibunAddress || '';
            form.detail_address = '';
        }
    }).open();
};

/* =========================
   수정 모드일 때 기존 정보 조회
========================= */
const loadInstitutionDetail = async () => {
    try {
        const result = await getInstitutionDetail(institutionNo.value);

        if (result.retCode === 'OK' && result.data) {
            const data = result.data;

            form.name = data.name || '';
            form.business_number = data.business_number || '';
            form.tel = data.tel || '';
            form.institution_email = data.institution_email || '';
            form.operation = Number(data.operation ?? 1);

            splitAddress(data.institution_address || '');
        } else {
            alert(result.message || '기관 정보 조회 실패');
        }
    } catch (err) {
        console.error('기관 정보 조회 실패:', err);
        alert('기관 정보를 불러오지 못했습니다.');
    }
};

/* =========================
   저장 처리
========================= */
const saveInstitution = async () => {
    try {
        if (!form.name.trim()) {
            alert('기관명을 입력하세요.');
            return;
        }

        if (!form.business_number.trim()) {
            alert('사업자번호를 입력하세요.');
            return;
        }

        if (!form.tel.trim()) {
            alert('연락처를 입력하세요.');
            return;
        }

        if (!form.institution_address.trim()) {
            alert('주소를 입력하세요.');
            return;
        }

        if (!form.institution_email.trim()) {
            alert('이메일을 입력하세요.');
            return;
        }

        const payload = {
            name: form.name,
            business_number: form.business_number,
            tel: form.tel,
            institution_address: makeFinalAddress(),
            institution_email: form.institution_email,
            operation: form.operation
        };

        let result;

        if (isEditMode.value) {
            result = await updateInstitution(institutionNo.value, payload);
        } else {
            result = await createInstitution(payload);
        }

        if (result.retCode === 'OK') {
            alert(isEditMode.value ? '수정되었습니다.' : '등록되었습니다.');
            router.push('/sysadmin/institutions');
        } else {
            alert(result.message || '저장 실패');
        }
    } catch (err) {
        console.error('기관 저장 실패:', err);
        alert('저장 중 오류가 발생했습니다.');
    }
};

/* =========================
   목록 페이지 이동
========================= */
const goList = () => {
    router.push('/sysadmin/institutions');
};

onMounted(() => {
    if (isEditMode.value) {
        loadInstitutionDetail();
    }
});
</script>

<template>
    <div class="p-6">
        <!-- =========================
             화면 제목
        ========================== -->
        <div class="mb-5">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">
                {{ isEditMode ? '기관 정보 수정' : '기관 등록' }}
            </div>
            <span class="text-muted-color">
                {{ isEditMode ? '기관 정보를 수정할 수 있습니다.' : '새 기관 정보를 등록할 수 있습니다.' }}
            </span>
        </div>

        <!-- =========================
             입력 폼
        ========================== -->
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">기관명</label>
                    <InputText v-model="form.name" class="w-full" />
                </div>

                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">사업자번호</label>
                    <InputText v-model="form.business_number" class="w-full" :class="{ 'readonly-field': isEditMode }" :readonly="isEditMode" />
                </div>

                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">연락처</label>
                    <InputText v-model="form.tel" class="w-full" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">주소</label>

                    <div class="flex flex-col sm:flex-row gap-2 mb-2">
                        <InputText v-model="form.zonecode" placeholder="우편번호" readonly class="w-full sm:w-40" />
                        <Button label="우편번호 찾기" type="button" @click="searchAddress" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <InputText v-model="form.institution_address" class="w-full" placeholder="기본주소" readonly />
                        <InputText v-model="form.detail_address" class="w-full" placeholder="상세 주소 입력" />
                    </div>
                </div>

                <div class="md:col-span-2">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">이메일</label>
                    <InputText v-model="form.institution_email" class="w-full" />
                </div>

                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">운영여부</label>
                    <div class="flex gap-6">
                        <label class="flex items-center gap-2">
                            <RadioButton v-model="form.operation" inputId="operation1" :value="1" />
                            <span>운영</span>
                        </label>

                        <label class="flex items-center gap-2">
                            <RadioButton v-model="form.operation" inputId="operation0" :value="0" />
                            <span>종료</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- =========================
                 버튼 영역
            ========================== -->
            <div class="flex justify-end gap-2 mt-6">
                <Button label="목록으로" severity="secondary" type="button" @click="goList" />
                <Button :label="isEditMode ? '수정저장' : '등록'" type="button" @click="saveInstitution" />
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.readonly-field) {
    background-color: #f3f4f6 !important;
    color: #6b7280 !important;
    border-color: #d1d5db !important;
    cursor: not-allowed;
}
</style>
