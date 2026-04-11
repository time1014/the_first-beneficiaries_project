<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getInstitutionMyPage } from '@/service/InstitutionMyPageService';

const router = useRouter();

// 기관담당자 본인정보 저장 변수
const info = ref(null);

// 날짜 표시용 함수
function formatDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

// 본인정보 조회 함수
async function loadMyInfo() {
    try {
        // localStorage에서 로그인 사용자 정보 가져오기
        const loginUser = JSON.parse(localStorage.getItem('user'));
        const userNo = loginUser?.user_no;

        if (!userNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await getInstitutionMyPage(userNo);

        if (result.retCode === 'OK') {
            info.value = result.data;
        } else {
            alert(result.message || '정보 조회 실패');
        }
    } catch (err) {
        console.error('기관담당자 정보 조회 오류:', err);
        alert('정보를 불러오지 못했습니다.');
    }
}

// 수정 페이지로 이동
function goEdit() {
    router.push('/institutioninfo/edit');
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
    <div class="md:w-full">
        <div class="h-9/10">
            <div class="card">
                <div class="mb-8">
                    <div class="text-surface-900 dark:text-surface-0 text-3xl font-bold mb-2">마이페이지</div>
                    <span class="text-muted-color text-lg">기관담당자 본인 정보를 확인할 수 있습니다.</span>
                </div>
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                    <div v-if="info">
                        <div class="grid gap-0">
                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 border-b border-surface-100 dark:border-surface-800 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">아이디</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ info.user_id }}</div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 border-b border-surface-100 dark:border-surface-800 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">이름</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ info.user_name }}</div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 border-b border-surface-100 dark:border-surface-800 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">전화번호</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ info.tel || '-' }}</div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 border-b border-surface-100 dark:border-surface-800 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">이메일</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ info.email }}</div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 border-b border-surface-100 dark:border-surface-800 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">소속 기관</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ info.institution_name || '-' }}</div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 py-4 items-center">
                                <div class="font-bold text-surface-800 dark:text-surface-200 text-lg">가입일</div>
                                <div class="text-surface-600 dark:text-surface-400 text-lg">{{ formatDate(info.created_at) }}</div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center mt-10 pt-4">
                            <Button label="회원탈퇴" severity="danger" class="px-6 py-2 font-semibold" @click="goToWithdraw" />
                            <!-- 이미지의 진한 남색 버튼 반영 -->
                            <Button label="수정" class="px-10 py-2 font-semibold bg-blue-900 border-none" @click="goEdit" />
                        </div>
                    </div>

                    <div v-else class="flex flex-col items-center py-20">
                        <i class="pi pi-spin pi-spinner text-3xl mb-4 text-primary"></i>
                        <div class="text-muted-color text-xl font-medium">정보를 불러오는 중입니다...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
