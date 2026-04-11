<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getInstitutionMyPage, updateInstitutionMyPage } from '@/service/InstitutionMyPageService';

const router = useRouter();
const userStore = useUserStore();

// 수정 폼
const form = reactive({
    user_no: null,
    user_id: '',
    user_name: '',
    tel: '',
    email: '',
    institution_name: '',
    created_at: ''
});

// 날짜 표시용
function formatDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

// 조회
async function loadMyInfo() {
    try {
        const loginUser = JSON.parse(localStorage.getItem('user'));
        const userNo = loginUser?.user_no;

        if (!userNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await getInstitutionMyPage(userNo);

        if (result.retCode === 'OK') {
            const data = result.data;

            form.user_no = data.user_no;
            form.user_id = data.user_id || '';
            form.user_name = data.user_name || '';
            form.tel = data.tel || '';
            form.email = data.email || '';
            form.institution_name = data.institution_name || '';
            form.created_at = data.created_at || '';
        } else {
            alert(result.message || '정보 조회 실패');
        }
    } catch (err) {
        console.error('기관담당자 수정정보 조회 오류:', err);
        alert('정보를 불러오지 못했습니다.');
    }
}

// 저장
async function saveInfo() {
    try {
        if (!form.user_name.trim()) {
            alert('이름을 입력하세요.');
            return;
        }

        if (!form.tel.trim()) {
            alert('전화번호를 입력하세요.');
            return;
        }

        const payload = {
            user_name: form.user_name,
            tel: form.tel
        };

        const result = await updateInstitutionMyPage(form.user_no, payload);

        if (result.retCode === 'OK') {
            userStore.updateUser({
                user_name: form.user_name,
                role: userStore.role
            });

            const loginUser = JSON.parse(localStorage.getItem('user')) || {};
            loginUser.user_name = form.user_name;
            localStorage.setItem('user', JSON.stringify(loginUser));

            alert('수정되었습니다.');
            router.push('/institutioninfo');
        } else {
            alert(result.message || '수정 실패');
        }
    } catch (err) {
        console.error('기관담당자 정보 수정 오류:', err);
        alert('수정 중 오류가 발생했습니다.');
    }
}

// 취소
function cancelEdit() {
    router.push('/institutioninfo');
}

onMounted(() => {
    loadMyInfo();
});
</script>

<template>
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <div class="mb-8">
                    <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">마이페이지</div>
                    <span class="text-muted-color text-lg"> 기관담당자 본인 정보를 수정할 수 있습니다. </span>
                </div>
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                    <DataTable
                        :value="[
                            { label: '아이디', field: 'user_id', readonly: true },
                            { label: '이름', field: 'user_name' },
                            { label: '전화번호', field: 'tel' },
                            { label: '이메일', field: 'email', readonly: true },
                            { label: '소속 기관', field: 'institution_name', readonly: true },
                            { label: '가입일', field: 'created_at', readonly: true }
                        ]"
                        class="institution-table"
                    >
                        <Column field="label" class="w-48 font-bold text-lg text-surface-700"></Column>
                        <Column field="field">
                            <template #body="slotProps">
                                <InputText v-if="slotProps.data.field === 'created_at'" :value="formatDate(form.created_at)" class="w-full readonly-field" readonly />
                                <InputText v-else-if="slotProps.data.readonly" v-model="form[slotProps.data.field]" class="w-full readonly-field" readonly />
                                <InputText v-else v-model="form[slotProps.data.field]" class="w-full" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="flex gap-2 justify-end mt-10 pt-4 border-t border-surface-100">
                    <Button label="취소" severity="secondary" outlined @click="cancelEdit" class="px-6"></Button>
                    <Button label="저장" @click="saveInfo" class="px-8 bg-blue-900 border-none"></Button>
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

:deep(.p-datatable-tbody > tr > td) {
    padding: 1rem 0.75rem !important;
}
</style>
