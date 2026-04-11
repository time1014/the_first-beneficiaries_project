<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getAdminMyPage, updateAdminMyPage } from '@/service/AdminMyPageService';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
    user_no: null,
    user_id: '',
    user_name: '',
    tel: '',
    email: '',
    institution_name: '',
    created_at: ''
});

function formatDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

async function loadMyInfo() {
    try {
        const loginUser = JSON.parse(localStorage.getItem('user'));
        const userNo = loginUser?.user_no;

        if (!userNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await getAdminMyPage(userNo);

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
        console.error('기관관리자 수정정보 조회 오류:', err);
        alert('정보를 불러오지 못했습니다.');
    }
}

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

        const result = await updateAdminMyPage(form.user_no, payload);

        if (result.retCode === 'OK') {
            userStore.updateUser({
                user_name: form.user_name,
                role: userStore.role
            });

            const loginUser = JSON.parse(localStorage.getItem('user')) || {};
            loginUser.user_name = form.user_name;
            localStorage.setItem('user', JSON.stringify(loginUser));
            alert('수정되었습니다.');
            router.push({
                path: '/admin/mypage',
                query: { tab: '0' }
            });
        } else {
            alert(result.message || '수정 실패');
        }
    } catch (err) {
        console.error('기관관리자 정보 수정 오류:', err);
        alert('수정 중 오류가 발생했습니다.');
    }
}

function cancelEdit() {
    router.push({
        path: '/admin/mypage',
        query: { tab: '0' }
    });
}

onMounted(() => {
    loadMyInfo();
});
</script>

<template>
    <div class="w-full">
        <div class="card">
            <div class="mb-5">
                <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">마이페이지</div>
                <span class="text-muted-color"> 기관관리자 본인 정보를 수정할 수 있습니다. </span>
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
                >
                    <Column field="label" class="w-3xs" />
                    <Column field="field">
                        <template #body="slotProps">
                            <!-- 가입일 (수정 불가) -->
                            <InputText v-if="slotProps.data.field === 'created_at'" :value="formatDate(form.created_at)" class="w-full readonly-field" readonly />
                            <InputText v-else-if="slotProps.data.readonly" :value="form[slotProps.data.field]" class="w-full readonly-field" readonly />
                            <InputText v-else v-model="form[slotProps.data.field]" class="w-full" :placeholder="slotProps.data.field === 'tel' ? '010-0000-0000' : ''" />
                        </template>
                    </Column>
                </DataTable>

                <div class="flex gap-2 justify-end mt-2">
                    <Button label="취소" severity="secondary" outlined @click="cancelEdit" />
                    <Button label="저장" @click="saveInfo" />
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
