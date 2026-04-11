<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const userId = ref('');
const email = ref(route.query.email || '');
const isLoading = ref(true);

// 아이디 조회
const getUserId = async () => {
    if (!email.value) {
        alert('잘못된 접근입니다.');
        router.push('/sign/find-id');
        return;
    }

    try {
        const res = await fetch('/api/user/find-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value
            })
        });

        const data = await res.json();

        if (data.retCode) {
            userId.value = data.user_id;
        } else {
            alert(data.message || '아이디를 찾을 수 없습니다.');
            router.push('/sign/find-id');
        }
    } catch (err) {
        console.log(err);
        router.push('/sign/find-id');
    } finally {
        isLoading.value = false;
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

// 비밀번호 찾기로 이동
const goToFindPassword = () => {
    router.push('/sign/find-password');
};

onBeforeMount(() => {
    getUserId();
});
</script>

<template>
    <!-- 왼쪽 -->
    <!-- <div class="flex-1 flex flex-col items-center justify-center bg-yellow-50 gap-4">
            <img :src="logoImage" alt="The_first 로고" class="w-72 max-w-4/5 object-contain" />
        </div> -->

    <!-- 오른쪽 -->
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex-1 flex items-center justify-center bg-white">
                        <div class="w-96 xl:w-[480px] flex flex-col gap-6">
                            <h2 class="text-2xl font-bold text-center text-surface-800">아이디 찾기</h2>
                            <div v-if="isLoading" class="result-box">
                                <p class="text-surface-600 text-lg">아이디를 조회하는 중입니다...</p>
                            </div>
                            <div v-else class="result-box">
                                <p class="text-surface-600 text-xl mb-2 font-bold">
                                    해당 사용자의 아이디는
                                    <span class="text-blue-600 text-3xl font-extrabold"> {{ userId }} </span>
                                    입니다.
                                </p>
                            </div>
                            <div class="flex justify-end items-center gap-2 text-sm">
                                <span class="link-text" @click="goToRegister">회원가입</span>
                                <Divider layout="vertical" class="!mx-0 !h-3" />
                                <span class="link-text" @click="goToFindPassword">비밀번호 찾기</span>
                            </div>

                            <Button label="로그인하기" size="large" fluid class="font-bold" @click="goToLogin" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.result-box {
    padding: 32px 24px;
    text-align: center;
}

.link-text {
    cursor: pointer;
    color: var(--p-text-muted-color);
    font-weight: 500;
}

.link-text:hover {
    color: var(--p-green-500);
    text-decoration: underline;
}
</style>
