<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getAdminMyPage } from '@/service/AdminMyPageService';

const router = useRouter();
const userStore = useUserStore();

// 기관관리자 본인정보 저장 변수
const info = ref(null);

// 날짜 표시용 함수
function formatDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

// 본인정보 조회 함수
async function loadMyInfo() {
    try {
        const loginUser = JSON.parse(localStorage.getItem('user'));
        console.log('loginUser:', loginUser);

        const userNo = loginUser?.user_no;
        console.log('userNo:', userNo);

        if (!userNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await getAdminMyPage(userNo);
        console.log('조회 결과:', result);

        if (result.retCode === 'OK') {
            info.value = result.data;

            userStore.updateUser({
                user_name: result.data.user_name,
                role: userStore.role
            });
        } else {
            alert(result.message || '정보 조회 실패');
        }
    } catch (err) {
        console.error('기관관리자 정보 조회 오류:', err);
        alert('정보를 불러오지 못했습니다.');
    }
}

// 수정 페이지로 이동
function goEdit() {
    router.push('/admin/mypage/edit');
}

// 회원탈퇴 페이지 이동_은지
function goToWithdraw() {
    router.push('/sign/with-draw');
}

// 화면 처음 열릴 때 조회
onMounted(() => {
    loadMyInfo();
});
</script>

<template>
    <div class="p-6">
        <div class="mb-5">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">마이페이지</div>
            <span class="text-muted-color"> 기관관리자 본인 정보를 확인할 수 있습니다. </span>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
            <div v-if="info" class="grid gap-3">
                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">아이디</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ info.user_id }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">이름</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ info.user_name }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">전화번호</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ info.tel || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">이메일</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ info.email || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">소속 기관</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ info.institution_name || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">가입일</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ formatDate(info.created_at) }}</div>
                </div>

                <div class="flex justify-between pt-3">
                    <Button label="회원탈퇴" severity="danger" @click="goToWithdraw" />
                    <Button label="수정" @click="goEdit" />
                </div>
            </div>

            <div v-else class="text-muted-color">정보를 불러오는 중입니다.</div>
        </div>
    </div>
</template>
