<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import logoImage from '@/assets/logo/logo.png';

const router = useRouter();
const userStore = useUserStore();

// 폼 데이터 초기화
const withdrawForm = ref({
    user_id: '',
    email: '',
    auth_code: ''
});

const dbEmail = ref('');
const isVerified = ref(false);

// 타이머 설정
const timer = ref(180);
let interval = null;
const isExpired = ref(false);

// 타이머
const startTimer = () => {
    timer.value = 180;
    isExpired.value = false;
    clearInterval(interval);
    interval = setInterval(() => {
        if (timer.value > 0) timer.value--;
        else {
            clearInterval(interval);
            isExpired.value = true;
            alert('인증시간이 만료되었습니다.');
        }
    }, 1000);
};

onUnmounted(() => clearInterval(interval));

const formatTime = computed(() => {
    const min = String(Math.floor(timer.value / 60)).padStart(2, '0');
    const sec = String(timer.value % 60).padStart(2, '0');
    return `${min}:${sec}`;
});

// 컴포넌트 로드 시 데이터 가져오기
onMounted(async () => {
    if (userStore.user_id) {
        withdrawForm.value.user_id = userStore.user_id;
        await loadUserInfo();
    } else {
        console.error('로그인된 사용자 정보(ID)를 찾을 수 없습니다.');
    }
});

// DB에서 이메일 조회
const loadUserInfo = async () => {
    try {
        const res = await fetch('/api/user/get-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: withdrawForm.value.user_id })
        });

        const data = await res.json();

        if (data.retCode) {
            dbEmail.value = data.email;
            if (data.user_id) withdrawForm.value.user_id = data.user_id;
        } else {
            alert(data.message || '사용자 정보 조회 실패');
        }
    } catch (err) {
        console.log(err);
    }
};

// 인증번호 발송 (DB 이메일 검증 포함)
const sendCode = async () => {
    if (withdrawForm.value.email !== dbEmail.value) {
        alert('입력한 이메일이 등록된 이메일과 다릅니다.');
        return;
    }
    try {
        const res = await fetch('/api/mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: withdrawForm.value.email })
        });
        if (res.ok) {
            startTimer();
            alert('인증번호가 발송되었습니다.');
        }
    } catch (err) {
        console.log(err);
    }
};

// 인증번호 확인
const verifyCode = async () => {
    if (!withdrawForm.value.auth_code) {
        alert('인증번호를 입력해주세요.');
        return;
    }
    try {
        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_email: withdrawForm.value.email,
                code: withdrawForm.value.auth_code
            })
        });
        const data = await res.json();
        if (data.retCode) {
            isVerified.value = true;
            clearInterval(interval);
            alert('인증되었습니다.');
        } else {
            alert('인증번호가 올바르지 않습니다.');
        }
    } catch (err) {
        console.log(err);
    }
};

// 탈퇴 처리
const handleWithdraw = async () => {
    if (!isVerified.value) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }
    if (confirm('정말 탈퇴하시겠습니까? 탈퇴 후 데이터 복구는 불가능합니다.')) {
        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: withdrawForm.value.user_id })
            });
            const data = await res.json();
            if (data.retCode) {
                alert('탈퇴 완료');
                router.push('/sign/login');
            } else {
                alert(data.message || '탈퇴 실패');
            }
        } catch (err) {
            console.log(err);
        }
    }
};

// 승인대기로 돌아가기
const goToBack = () => {
    router.push('/sign/access');
};
</script>
<template>
    <!-- 오른쪽 폼 -->
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex-1 flex items-center justify-center bg-white">
                        <div class="w-96 xl:w-[480px] flex flex-col gap-5">
                            <h2 class="text-2xl font-bold text-center text-surface-800">회원 탈퇴</h2>
                            <p class="text-xl text-[#FF4500] text-center font-bold">회원 탈퇴를 진행하시겠습니까? 현재 제공받고 계신 지원 서비스에 차질이 생길 수 있으니 신중하게 결정해 주세요.</p>

                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-surface-700">아이디</label>
                                <InputText v-model="withdrawForm.user_id" size="large" fluid disabled />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-surface-700">이메일 인증</label>
                                <InputGroup>
                                    <InputText v-model="withdrawForm.email" placeholder="이메일을 입력하세요" size="large" :disabled="isVerified" />
                                    <Button label="인증하기" size="large" class="font-bold auth-btn custom-primary-btn" @click="sendCode" :disabled="isVerified" />
                                </InputGroup>
                            </div>

                            <div class="flex flex-col gap-1">
                                <label class="font-semibold text-surface-700">인증번호</label>
                                <InputGroup>
                                    <InputText v-model="withdrawForm.auth_code" placeholder="인증번호를 입력하세요" size="large" class="pr-20" :disabled="isVerified" />
                                    <InputGroupAddon class="timer-addon" v-if="!isVerified">
                                        <span class="timer-text">{{ formatTime }}</span>
                                    </InputGroupAddon>
                                    <Button label="확인하기" size="large" class="font-bold auth-btn custom-primary-btn" @click="verifyCode" :disabled="isVerified" />
                                </InputGroup>

                                <span class="text-red-500 text-sm" v-if="!isVerified"> * 본인 확인을 위해 이메일 인증을 진행해주세요. </span>
                                <span class="text-primary-color text-sm" v-else> * 인증이 완료되었습니다. </span>
                            </div>

                            <div class="flex justify-end items-center gap-2 text-sm">
                                <span class="link-text" @click="goToBack">취소하고 돌아가기</span>
                            </div>

                            <Button label="회원 탈퇴하기" severity="danger" size="large" fluid class="font-bold" :disabled="!isVerified" @click="handleWithdraw" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-primary-btn {
    background-color: #034487 !important;
    border-color: #034487 !important;
    color: #ffffff !important;
}

.custom-primary-btn:hover {
    background-color: #033d7a !important;
}

.custom-primary-btn:disabled {
    background-color: #adc9e3 !important;
    border-color: #adc9e3 !important;
    opacity: 0.6;
}

.auth-btn {
    width: 100px !important;
    flex-shrink: 0;
}

.timer-text {
    color: #034487 !important;
    font-variant-numeric: tabular-nums;
}

.timer-addon {
    background: transparent !important;
    border-left: none !important;
    border-right: none !important;
    font-weight: 600;
}

.text-primary-color {
    color: #034487 !important;
    font-weight: 500;
}

:deep(.p-inputtext:enabled:focus) {
    border-color: #034487 !important;
    box-shadow: 0 0 0 0.2rem rgba(3, 68, 135, 0.2) !important;
}

.p-inputgroup .p-inputtext {
    border-right: none !important;
}

.p-inputgroup .p-button {
    border-left: none !important;
}

.link-text {
    cursor: pointer;
    color: var(--p-text-muted-color);
    font-weight: 500;
    transition: color 0.2s;
}

.link-text:hover {
    color: #034487 !important;
    text-decoration: underline;
}
</style>
