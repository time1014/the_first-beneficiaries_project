<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const approver = userStore.user_no;
const reason_rejection = ref('');
const userbeneStore = useBeneStore();
const route = useRoute();
const selectNo = Number(route.params.no);
const priorityNo = computed(() => dropdownValue.value?.priority_no);
const dropdownValue = ref(null);
const priority = ref([]);
const priorityAlert = ref([]);

const filteredPriority = computed(() => {
    return priority.value.filter((item) => item.approval === 'a0');
});

const filteredApprovalForm = computed(() => {
    return priority.value.filter((item) => item.approval === 'a1');
});

const addPriorityInfo = async (approval, reason_rejection) => {
    console.log(`우선순위 번호 -> ${Number(priorityNo.value)}`);
    console.log(`승인, 반려 -> ${approval}`);
    console.log(`작성자 번호 -> ${approver}`);
    console.log(`반려사유 -> ${reason_rejection}`);
    let data = {
        approval: approval,
        approver: approver,
        reason_rejection: reason_rejection
    };

    console.log(data);

    let result = await fetch(`/api/priority/${Number(priorityNo.value)}`, {
        method: 'put',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch((err) => console.log(err));
    if (result.ok == true) {
        alert(`요청 하였습니다.`);
        window.location.reload(true);
    } else {
        alert('요청 실패하였습니다.');
    }
};

onBeforeMount(async () => {
    try {
        const resp = await fetch(`/api/priority/${selectNo}`);
        const data = await resp.json();
        priority.value = data;
        console.log(priority.value);
    } catch (err) {
        console.log(err);
    }
    console.log(dropdownValue.value);
});
</script>
<template>
    <div class="p-6 bg-slate-100 card h-220">
        <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl h-full flex flex-col">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">우선순위 승인여부</h2>

            <div>
                <h3 v-if="filteredPriority.length == 0 && filteredApprovalForm.length == 0" class="text-lg font-bold mb-4 border-b pb-2">대기중인 우선순위가 없습니다.</h3>
                <h3 v-if="filteredApprovalForm.length > 0" class="text-lg font-bold mb-4 border-b pb-2">우선순위 선정이 완료되었습니다.</h3>
                <Select v-if="filteredPriority.length > 0" v-model="dropdownValue" :options="filteredPriority" optionLabel="priority_no" placeholder="지정할 우선순위 선택하기" />
            </div>
            <div v-if="dropdownValue" class="mb-6 border-b pb-4">
                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                    <button v-if="dropdownValue.priority_id === 'd1'" class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-gray-400 text-white">계획</button>
                    <button v-else-if="dropdownValue.priority_id === 'd2'" class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-green-500 text-white">중점</button>
                    <button v-else-if="dropdownValue.priority_id === 'd3'" class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-red-500 text-white">긴급</button>
                </div>
                <div>
                    <label for="reason_rejection" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">반려사유</label>
                    <InputText id="reason_rejection" type="text" placeholder="반려사유를 입력해주세요" class="w-full md:w-[30rem] mb-8" v-model="reason_rejection" />
                </div>
                <div class="text-right">
                    <Button label="승인" type="button" @click="addPriorityInfo('a1')" class="px-6 py-2 rounded-full" />
                    <Button type="button" label="반려" severity="danger"
                        :disabled="!reason_rejection || reason_rejection.trim() === ''"
                        @click="addPriorityInfo('a2', reason_rejection)"
                        class="px-6 py-2 text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                    />
     
                </div>
            </div>
        </div>
    </div>
</template>
