<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import AdminMyInfo from './AdminMyInfo.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const institution = ref(null);
const activeTab = ref(Number(route.query.tab ?? 0));

watch(
    () => route.query.tab,
    (newTab) => {
        activeTab.value = Number(newTab ?? 0);
    }
);

const findAllInfo = async () => {
    try {
        const insNo = userStore.institution;
        const res = await fetch(`/api/admin/institutioninfo/${insNo}`);
        const info = await res.json();
        institution.value = info;
    } catch (err) {
        console.log(err);
    }
};
const changeTab = (tabValue) => {
    router.push({
        path: '/admin/mypage',
        query: { tab: String(tabValue) }
    });
};
const goToEditForm = () => {
    router.push({
        path: '/admin/institutioninfo/edit',
        query: { tab: '1' }
    });
};

onBeforeMount(() => {
    findAllInfo();
});
</script>

<template>
    <div class="w-full mt-4">
        <div class="card">
            <Tabs v-model:value="activeTab">
                <TabList>
                    <Tab :value="0">내 정보</Tab>
                    <Tab :value="1">기관정보</Tab>
                </TabList>
            </Tabs>
            <div v-if="activeTab === 0" class="mt-4">
                <AdminMyInfo />
            </div>
            <div v-else-if="activeTab === 1" class="mt-4">
                <div v-if="institution">
                    <div class="p-6">
                        <div class="mb-5">
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">마이페이지</div>
                            <span class="text-muted-color">기관관리자 기관 정보를 확인할 수 있습니다.</span>
                        </div>
                        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                            <div class="grid gap-3">
                                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                                    <div class="font-semibold text-surface-700 dark:text-surface-200">기관명</div>
                                    <div class="text-surface-900 dark:text-surface-0">{{ institution.name || '-' }}</div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                                    <div class="font-semibold text-surface-700 dark:text-surface-200">사업자번호</div>
                                    <div class="text-surface-900 dark:text-surface-0">{{ institution.business_number || '-' }}</div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                                    <div class="font-semibold text-surface-700 dark:text-surface-200">대표번호</div>
                                    <div class="text-surface-900 dark:text-surface-0">{{ institution.tel || '-' }}</div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                                    <div class="font-semibold text-surface-700 dark:text-surface-200">주소</div>
                                    <div class="text-surface-900 dark:text-surface-0">{{ institution.institution_address || '-' }}</div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2">
                                    <div class="font-semibold text-surface-700 dark:text-surface-200">이메일</div>
                                    <div class="text-surface-900 dark:text-surface-0">{{ institution.institution_email || '-' }}</div>
                                </div>

                                <div class="flex justify-end pt-3">
                                    <Button label="수정" @click="goToEditForm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="p-6 text-muted-color">정보를 불러오는 중입니다.</div>
            </div>
        </div>
    </div>
</template>
