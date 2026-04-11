<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logoImage from '@/assets/logo/logo.png';

const route = useRoute();
const router = useRouter();

const resetForm = ref({
    user_id: route.query.user_id || '',
    email: route.query.email || '',
    new_pw: '',
    new_pw_check: ''
});

// 비밀번호 보기/숨기기
const showPassword = ref(false);
const showPasswordCheck = ref(false);

// 비밀번호 일치 여부
const isPasswordMatched = computed(() => {
    return resetForm.value.new_pw && resetForm.value.new_pw_check && resetForm.value.new_pw === resetForm.value.new_pw_check;
});

// 비밀번호 길이 체크
const isPasswordValid = computed(() => {
    return resetForm.value.new_pw.length >= 8;
});

// 비밀번호 변경
const resetPassword = async () => {
    if (!resetForm.value.new_pw) {
        alert('비밀번호를 입력해주세요.');
        return;
    }
    if (!resetForm.value.new_pw_check) {
        alert('비밀번호 확인을 입력해주세요.');
        return;
    }
    if (!isPasswordValid.value) {
        alert('비밀번호는 8자 이상 입력해주세요.');
        return;
    }
    if (!isPasswordMatched.value) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    try {
        const res = await fetch(`/api/userpw/${resetForm.value.user_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_pw: resetForm.value.new_pw
            })
        });
        const data = await res.json();

        if (!res.ok || !data.status) {
            alert(data.message || '비밀번호 변경에 실패했습니다.');
            return;
        }

        alert('비밀번호가 변경되었습니다.');
        router.push('/sign/login');
    } catch (err) {
        console.error(err);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
};

// 로그인으로 이동
const goToLogin = () => {
    router.push('/sign/login');
};

// 회원가입으로 이동
const goToRegister = () => {
    router.push('/sign/register');
};
</script>

<template>
    <!-- 오른쪽 -->
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex-1 flex items-center justify-center bg-white">
                        <form class="w-96 xl:w-[480px] flex flex-col gap-5" @submit.prevent="resetPassword">
                            <h2 class="text-2xl font-bold text-center text-surface-800">비밀번호 재설정</h2>

                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-surface-700">아이디</label>
                                <InputText v-model="resetForm.user_id" size="large" fluid disabled />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-surface-700">비밀번호</label>
                                <InputGroup>
                                    <InputText v-model="resetForm.new_pw" :type="showPassword ? 'text' : 'password'" placeholder="비밀번호를 입력하세요" size="large" />
                                    <Button :icon="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" outlined type="button" @click="showPassword = !showPassword" />
                                </InputGroup>
                                <span class="text-sm text-gray-500"> * 비밀번호는 8자 이상 입력해주세요. </span>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="font-semibold text-surface-700">비밀번호 확인</label>
                                <InputGroup>
                                    <InputText v-model="resetForm.new_pw_check" :type="showPasswordCheck ? 'text' : 'password'" placeholder="비밀번호를 재입력하세요" size="large" />
                                    <Button :icon="showPasswordCheck ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" outlined type="button" @click="showPasswordCheck = !showPasswordCheck" />
                                </InputGroup>
                                <span v-if="resetForm.new_pw_check && !isPasswordMatched" class="text-red-500 text-sm"> * 비밀번호가 일치하지 않습니다. </span>
                                <!-- 일치 시 텍스트 색상 변경 -->
                                <span v-if="resetForm.new_pw_check && isPasswordMatched" class="text-primary-color text-sm"> ✔ 비밀번호가 일치합니다. </span>
                            </div>

                            <div class="flex justify-end items-center gap-2 text-sm">
                                <span class="link-text" @click="goToLogin">로그인으로 이동</span>
                                <Divider layout="vertical" class="!mx-0 !h-3" />
                                <span class="link-text" @click="goToRegister">회원가입</span>
                            </div>

                            <Button label="비밀번호 변경" size="large" fluid class="font-bold custom-primary-btn" type="submit" />
                        </form>
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

.text-primary-color {
    color: #034487 !important;
    font-weight: 600;
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

:deep(.p-inputtext:enabled:focus) {
    border-color: #034487 !important;
    box-shadow: 0 0 0 0.2rem rgba(3, 68, 135, 0.2) !important;
}

:deep(.p-button.p-button-outlined.p-button-secondary:enabled:focus) {
    box-shadow: 0 0 0 0.2rem rgba(3, 68, 135, 0.1) !important;
}

.bg-yellow-50 {
    background-color: #ffffff !important;
}
</style>
