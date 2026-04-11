<script setup>
import { ref, onBeforeMount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const approvalList = ref([]);

const approval = async () => {
    await fetch(`/api/admin-approval`)
        .then((resp) => resp.json())
        .then((data) => {
            approvalList.value = Array.isArray(data) ? data : [data];
        })
        .catch((err) => console.log(err));
};

const approvalAcess = async (data) => {
    const userId = data.id;
    const userName = data.name;

    let result = await fetch('/api/access', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
    })
        .then((resp) => resp.json())
        .catch((err) => console.log(err));

    if (result.update == 'success') {
        alert(`${userName}님의 회원가입 승인처리 완료`);
        await approval();
    } else {
        alert('승인처리 중에 문제가 생겼습니다');
    }
};

const approvalRefuse = async (data) => {
    const userId = data.id;
    const userName = data.name;

    let result = await fetch('/api/access/refuse', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
    })
        .then((resp) => resp.json())
        .catch((err) => console.log(err));

    if (result.update == 'success') {
        alert(`${userName}님의 회원가입 반려처리 완료`);
        await approval();
    } else {
        alert('반려처리 중에 문제가 생겼습니다');
    }
};

onBeforeMount(() => {
    approval();
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>

<template>
    <div class="card">
        <div class="mb-5">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-1">회원가입 승인요청</div>
        </div>
        <div class="flex justify-end items-center mb-3">
            <div class="flex gap-2 items-center">
                <InputText v-model="filters.global.value" placeholder="검색" class="w-72" />
                <Button icon="pi pi-search" />
                <Button icon="pi pi-refresh" severity="secondary" outlined @click="filters.global.value = null" />
            </div>
        </div>
        <DataTable :value="approvalList" class="w-full institution-table" paginator :rows="10" v-model:filters="filters" :filters="filters" :globalFilterFields="['no', 'name', 'id', 'ins', 'tel', 'email', 'created_at']">
            <Column field="no">
                <template #header>
                    <div class="w-full text-center font-bold">번호</div>
                </template>
            </Column>
            <Column field="name">
                <template #header>
                    <div class="w-full text-center font-bold">이름</div>
                </template>
            </Column>
            <Column field="id">
                <template #header>
                    <div class="w-full text-center font-bold">아이디</div>
                </template>
            </Column>
            <Column field="ins">
                <template #header>
                    <div class="w-full text-center font-bold">기관명</div>
                </template>
            </Column>
            <Column field="tel">
                <template #header>
                    <div class="w-full text-center font-bold">연락처</div>
                </template>
            </Column>
            <Column field="email">
                <template #header>
                    <div class="w-full text-center font-bold">이메일</div>
                </template>
            </Column>
            <Column field="created_at">
                <template #header>
                    <div class="w-full text-center font-bold">가입일</div>
                </template>
            </Column>
            <Column>
                <template #header>
                    <div class="w-full text-center font-bold">사용승인</div>
                </template>
                <template #body="slotProps">
                    <Button label="승인" size="small" @click="approvalAcess(slotProps.data)" />
                </template>
            </Column>
            <Column>
                <template #header>
                    <div class="w-full text-center font-bold">반려</div>
                </template>
                <template #body="slotProps">
                    <Button label="반려" severity="danger" size="small" @click="approvalRefuse(slotProps.data)" />
                </template>
            </Column>

            <template #empty>
                <div class="py-6 text-center text-muted-color">조회된 승인 요청이 없습니다.</div>
            </template>
        </DataTable>
    </div>
</template>
<style scoped>
:deep(.institution-table .p-datatable-tbody > tr > td) {
    text-align: center;
    vertical-align: middle;
    padding: 0.9rem 0.75rem;
    border-bottom: 1px solid var(--p-content-border-color);
}

:deep(.institution-table .p-datatable-tbody > tr) {
    transition: background-color 0.2s ease;
}

:deep(.institution-table .p-datatable-tbody > tr:hover > td) {
    background-color: var(--p-surface-100);
}

:deep(.institution-table .p-paginator) {
    justify-content: center;
}
</style>
