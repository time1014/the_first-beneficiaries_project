<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const user_no = userStore.user_no;

const userbeneStore = useBeneStore();
const route = useRoute();
const selectNo = Number(route.params.no);
const priority = ref(null);
const priorityAlert = ref('미지정');

const clickPriority = async (role_name) => {
    console.log(role_name);
    priority.value = role_name;
    console.log(`우선순위 ${priority.value}`);

    if (priority.value === 'd1') {
        priorityAlert.value = '계획';
    } else if (priority.value === 'd2') {
        priorityAlert.value = '중점';
    } else if (priority.value === 'd3') {
        priorityAlert.value = '긴급';
    }
};

const addPriorityInfo = async () => {
    console.log(`우선순위 번호 -> ${priority}`);
    console.log(`조사지 번호 -> ${selectNo}`);
    console.log(`작성자 번호 -> ${user_no}`);
    let data = {
        priority_id: priority.value,
        survey_no: selectNo,
        writer_no: user_no
    };

    let result = await fetch(`/api/priority`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch((err) => console.log(err));
    console.log(result);
    if (result.ok == true) {
        alert('승인요청을 보냈습니다.');
        window.location.reload(true);
    } else {
        alert('승인요청 실패하였습니다.');
    }
};
const priorityList = ref([]);
const filteredApprovalForm = computed(() => {
    console.log(priorityList.value);
    return priorityList.value.filter((item) => item.approval === 'a1');
});

onBeforeMount(async () => {
    try {
        const resp = await fetch(`/api/priority/${selectNo}`);
        const data = await resp.json();
        priorityList.value = data;
        console.log(priorityList.value);
    } catch (err) {
        console.log(err);
    }
});
</script>
<template>
    <div class="card h-220 flex flex-col gap-4">
        <div class="max-h-[800px] overflow-y-auto pr-2">
        <span v-if="filteredApprovalForm.length > 0" class="text-m font-bold mb-4 border-b pb-2">우선순위가 이미 선정되었습니다.</span>

        <div v-if="filteredApprovalForm.length === 0" class="max-w-2xl mx-auto">
            <h2 class="text-lg font-bold mb-4 border-b pb-2">우선순위 입력</h2>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                <button class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-gray-400 text-white" @click="clickPriority('d1')">계획</button>
                <button class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-green-500 text-white" @click="clickPriority('d2')">중점</button>
                <button class="w-40 h-40 rounded-full flex items-center justify-center text-lg font-bold bg-red-500 text-white" @click="clickPriority('d3')">긴급</button>
            </div>
            <h2 class="text-lg font-bold mb-4 border-b pb-2">우선순위가 {{ priorityAlert }}입니다.</h2>

            <div class="text-right">
                <Button label="등록" type="button" @click="addPriorityInfo" />
            </div>
        </div>
    </div>
    </div>
</template>
