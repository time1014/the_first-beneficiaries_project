<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import logoImage from '@/assets/logo/logo.png';

const router = useRouter();

const findForm = ref({
    user_id: '',
    email: '',
    auth_code: ''
});

const isVerified = ref(false);
const isUserMatched = ref(false);

// 타이머
const timer = ref(180);
let interval = null;
const isExpired = ref(false);

// 값이 바뀌면 기존 인증 상태 초기화
watch(
    () => [findForm.value.user_id, findForm.value.email],
    () => {
        isVerified.value = false;
        isUserMatched.value = false;
        findForm.value.auth_code = '';
        isExpired.value = false;
        clearInterval(interval);
    }
);

// 타이머 시작
const startTimer = () => {
    timer.value = 180;
    isExpired.value = false;

    clearInterval(interval);

    interval = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        }

        if (timer.value <= 0) {
            clearInterval(interval);
            isExpired.value = true;
            alert('인증시간이 만료되었습니다.');
        }
    }, 1000);
};

// 컴포넌트 벗어나면 타이머 정리
onUnmounted(() => {
    clearInterval(interval);
});

// 타이머 포맷
const formatTime = computed(() => {
    const min = String(Math.floor(timer.value / 60)).padStart(2, '0');
    const sec = String(timer.value % 60).padStart(2, '0');
    return `${min}:${sec}`;
});

// 아이디 및 이메일 DB 일치 확인 함수
const checkUserMatch = async () => {
    if (!findForm.value.user_id) {
        alert('아이디를 입력해주세요.');
        return false;
    }
    if (!findForm.value.email) {
        alert('이메일을 입력해주세요.');
        return false;
    }
    try {
        const checkRes = await fetch('/api/user/check-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: findForm.value.user_id,
                email: findForm.value.email
            })
        });

        const checkData = await checkRes.json();

        if (!checkRes.ok || !checkData.status) {
            isUserMatched.value = false;
            alert(checkData.message || '아이디 또는 이메일이 일치하지 않습니다.');
            return false;
        }

        isUserMatched.value = true;
        return true;
    } catch (err) {
        console.error(err);
        isUserMatched.value = false;
        alert('사용자 확인 중 오류가 발생했습니다.');
        return false;
    }
};

// 이메일 인증번호 발송(이메일 인증)
const sendCode = async (email) => {
    if (!findForm.value.user_id) {
        alert('아이디를 입력해주세요.');
        return;
    }
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }
    try {
        // 아이디 및 이메일 실제 회원인지 확인
        const isValidUser = await checkUserMatch();
        if (!isValidUser) return;

        // 사용자 확인 성공 시에만 메일 발송
        const res = await fetch('/api/mail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });

        await res.json();
        isVerified.value = false;
        startTimer();
        alert('인증번호가 발송되었습니다.');
    } catch (err) {
        console.error(err);
    }
};

// 인증 완료(인증하기)
const verifyCode = async (code) => {
    if (!code) {
        alert('인증번호를 입력해주세요.');
        return;
    }
    if (isExpired.value) {
        alert('인증시간이 만료되었습니다. 다시 인증해주세요.');
        return;
    }
    // 인증 확인 전에 아이디+이메일 다시 일치 확인
    const isValidUser = await checkUserMatch();
    if (!isValidUser) return;
    try {
        const emailData = {
            user_email: findForm.value.email,
            code: code
        };
        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        const data = await res.json();
        if (data.retCode === true) {
            isVerified.value = true;
            clearInterval(interval);
            alert('인증 성공');
        } else {
            alert(data.message || '인증번호가 올바르지 않습니다.');
        }
    } catch (err) {
        console.error(err);
    }
};

// 아이디 찾기로 이동
const goToFindId = () => {
    router.push('/sign/find-id');
};

// 회원가입으로 이동
const goToRegister = () => {
    router.push('/sign/register');
};

// 비밀번호 재설정으로 이동
const goToResetPassword = () => {
    router.push({
        path: '/sign/reset-password',
        query: {
            user_id: findForm.value.user_id,
            email: findForm.value.email
        }
    });
};
</script>

<template>
    <!-- 오른쪽 -->
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="xl:w-[480px] flex flex-col gap-5">
                        <h2 class="text-2xl font-bold text-center text-surface-800">비밀번호 찾기</h2>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-700">아이디</label>
                            <InputText v-model="findForm.user_id" placeholder="아이디를 입력하세요" size="large" fluid :disabled="isVerified" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-surface-700">이메일</label>
                            <InputGroup>
                                <InputText v-model="findForm.email" placeholder="이메일을 입력하세요" size="large" :disabled="isVerified" />
                                <Button label="인증하기" size="large" class="font-bold auth-btn custom-primary-btn" @click="sendCode(findForm.email)" :disabled="isVerified" />
                            </InputGroup>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="font-semibold text-surface-700">인증번호</label>
                            <InputGroup>
                                <InputText v-model="findForm.auth_code" placeholder="인증번호를 입력하세요" size="large" class="pr-20" :disabled="isVerified" />
                                <InputGroupAddon class="timer-addon" v-if="!isVerified">
                                    <span class="timer-text">{{ formatTime }}</span>
                                </InputGroupAddon>

                                <Button label="확인하기" size="large" class="font-bold auth-btn custom-primary-btn" @click="verifyCode(findForm.auth_code)" :disabled="isVerified" />
                            </InputGroup>

                            <span class="text-red-500 text-sm" v-if="!isVerified"> * 이메일 인증을 진행해주세요. </span>
                            <span class="text-primary-color text-sm" v-else> * 인증이 완료되었습니다. </span>
                        </div>

                        <div class="flex justify-end items-center gap-2 text-sm">
                            <span class="link-text" @click="goToFindId">아이디 찾기</span>
                            <Divider layout="vertical" class="!mx-0 !h-3" />
                            <span class="link-text" @click="goToRegister">회원가입</span>
                        </div>

                        <Button label="비밀번호 재설정" size="large" fluid class="font-bold custom-primary-btn" :disabled="!isVerified" @click="goToResetPassword" />
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
