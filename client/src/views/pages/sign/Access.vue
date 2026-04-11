<script setup>
import { ref, onBeforeMount } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const logOut = () => {
    userStore.logout();
};

const userIns = userStore.institution;
const institutionTel = ref('');

const insTel = async (no) => {
    const resp = await fetch(`/api/institution/${no}`);
    const data = await resp.json();
    console.log(data);
    institutionTel.value = data.tel;
};

onBeforeMount(() => {
    insTel(userIns);
});
</script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="gap-4 flex flex-col items-center">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-4xl lg:text-5xl mb-2">승인대기</h1>
                        <span class="text-muted-color mb-8">본 서비스는 가입하시는 기관의 관리자 승인 처리 후 이용 가능합니다.</span>
                        <img src="/demo/images/access/asset-access.svg" alt="Access denied" class="mb-8" width="80%" />
                        <i class="pi pi-exclamation-circle"> 문의사항은 기관으로 연락 바랍니다</i>
                        <span class="text-xl"> 기관 대표번호 : {{ institutionTel }} </span>
                        <Button as="router-link" label="로그인페이지로 돌아가기" class="w-full" to="/sign/login" @click="logOut" />
                        <div class="col-span-12 mt-8 text-center">
                            <Button as="router-link" label="로그아웃" to="/sign/login" class="accessBtn" @click="logOut" />
                            <Button as="router-link" label="회원탈퇴" to="/sign/with-draw" severity="danger" class="accessBtn" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.accessBtn {
    margin: 10px;
}
</style>
