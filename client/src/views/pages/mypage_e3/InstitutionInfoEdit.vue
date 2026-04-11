<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onBeforeMount } from 'vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeTab = ref(Number(route.query.tab ?? 1));
const institution = ref({});

// 기관정보 조회 API
const findAllInfo = async () => {
    try {
        const insNo = userStore.institution;

        const res = await fetch(`/api/admin/institutioninfo/${insNo}`);
        const info = await res.json();
        institution.value = {
            ...info,
            institution_no: insNo
        };
        // 주소 나누기(우편번호/기본주소/상세주소)
        splitAddress(info.institution_address);
    } catch (err) {
        console.log(err);
    }
};

// 주소 합치기(저장용)
function makeFinalAddress() {
    return [institution.value.zonecode ? `(${institution.value.zonecode})` : '', institution.value.institution_address, institution.value.detail_address].filter(Boolean).join(' ').trim();
}

// 기관정보 수정 API
const save = async () => {
    try {
        const insNo = userStore.institution;

        const dataToSave = {
            institution_no: insNo, // PK
            name: institution.value.name,
            business_number: institution.value.business_number,
            tel: institution.value.tel,
            institution_address: makeFinalAddress(), // 우편번호/기본주소/상세주소 합친 주소
            institution_email: institution.value.institution_email,
            operation: institution.value.operation
        };
        const res = await fetch('/api/admin/institutioninfo', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });

        if (res.ok) {
            const result = await res.json();
            console.log('수정 완료 : ', result);
            // 성공시 조회 페이지로 이동
            router.push({ path: '/admin/institutioninfo', query: { tab: 1 } });
        } else {
            console.error('수정 실패:', res.statusText);
        }
    } catch (err) {
        console.log(err);
    }
};

// 주소 문자열 -> 분리(조회 시)
function splitAddress(fullAddress) {
    if (!fullAddress) {
        institution.value.zonecode = '';
        institution.value.institution_address = '';
        institution.value.detail_address = '';
        return;
    }

    const text = String(fullAddress).trim();
    const zoneMatch = text.match(/^\((\d{5})\)\s*/);

    if (zoneMatch) {
        institution.value.zonecode = zoneMatch[1]; // 우편번호
        institution.value.institution_address = text.replace(/^\(\d{5}\)\s*/, ''); // 기본주소
        institution.value.detail_address = ''; // 상세주호 초기화
    } else {
        institution.value.zonecode = '';
        institution.value.institution_address = text;
        institution.value.detail_address = '';
    }
}

function searchAddress() {
    new window.daum.Postcode({
        oncomplete: function (data) {
            // 우편번호
            institution.value.zonecode = data.zonecode;
            // 기본주소 (도로명 우선)
            institution.value.institution_address = data.roadAddress || data.jibunAddress;
            // 상세주소 초기화
            institution.value.detail_address = '';
        }
    }).open();
}

function cancelEdit() {
    router.push({
        path: '/admin/institutioninfo',
        query: { tab: '1' }
    });
}

// 컴포넌트 시작시 데이터 조회
onBeforeMount(findAllInfo);
</script>
<template>
    <div class="w-full">
        <div class="w-full">
            <div class="card">
                <div v-if="activeTab === 1 && institution" class="mt-4">
                    <div class="mb-5">
                        <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">마이페이지</div>
                        <span class="text-muted-color"> 기관관리자 기관 정보를 수정할 수 있습니다. </span>
                    </div>
                    <DataTable
                        :value="[
                            { label: '기관', field: 'name' },
                            { label: '사업자번호', field: 'business_number', readonly: true },
                            { label: '대표번호', field: 'tel' },
                            { label: '주소', field: 'institution_address' },
                            { label: '이메일', field: 'institution_email' }
                        ]"
                    >
                        <Column field="label" class="w-3xs"></Column>
                        <Column field="field">
                            <template #body="slotProps">
                                <InputText v-if="slotProps.data.field === 'business_number'" :value="institution.business_number" class="w-full readonly-field" readonly />
                                <div v-else-if="slotProps.data.field === 'institution_address'" class="flex flex-col gap-2 w-full">
                                    <div class="flex gap-2">
                                        <InputText v-model="institution.zonecode" class="w-32 readonly-field" readonly />
                                        <Button label="우편번호 검색" @click="searchAddress" />
                                    </div>

                                    <InputText v-model="institution.institution_address" class="readonly-field" readonly />
                                    <InputText v-model="institution.detail_address" placeholder="상세 주소 입력" />
                                </div>
                                <InputText v-else-if="slotProps.data.readonly" :value="institution[slotProps.data.field]" class="w-full readonly-field" readonly />
                                <InputText v-else v-model="institution[slotProps.data.field]" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="flex gap-2 justify-end mt-2">
                    <Button label="취소" severity="secondary" outlined @click="cancelEdit"></Button>
                    <Button label="저장" @click="save"></Button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
:deep(.readonly-field) {
    background-color: #f3f4f6 !important;
    color: #6b7280 !important;
    border-color: #e5e7eb !important;
    cursor: default !important;
}
</style>
