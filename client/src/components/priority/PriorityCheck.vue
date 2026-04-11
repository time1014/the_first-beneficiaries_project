<script setup>
import { onBeforeMount, ref } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';

const userbeneStore = useBeneStore();
const route = useRoute();
const selectNo = Number(route.params.no);

const priority = ref([]);

onBeforeMount(async () => {
    console.log(`조사지 번호${selectNo}`);
    try {
        const resp = await fetch(`/api/priority/${selectNo}`);
        const data = await resp.json();
        priority.value = data;
        console.log(priority.value);
    } catch {
        (err) => console.log(err);
    }
});
</script>
<template>
    <div class="card md:h-12/19 flex flex-col gap 4">
        <div class="overflow-y-auto">
            <div class="font-bold text-lg mb-2 border-b pb-2">우선순위 조회</div>
            <div v-if="priority.length === 0" class="text-center text-gray-500 py-10">등록된 우선순위 요청이 없습니다.</div>

            <div v-for="data in priority" class="mb-6 border-b pb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span v-if="data.approval === 'a0'">{{ data.priority_no }}. 우선순위 승인 여부 : 대기</span>
                        <span v-if="data.approval === 'a1'">{{ data.priority_no }}. 우선순위 승인 여부 : 승인</span>
                        <span v-if="data.approval === 'a2'">{{ data.priority_no }}. 우선순위 승인 여부 : 반려</span>

                        <Message v-if="data.priority_id === 'd1'" severity="secondary">계획</Message>
                        <Message v-if="data.priority_id === 'd2'" severity="success">중점</Message>
                        <Message v-if="data.priority_id === 'd3'" severity="error">긴급</Message>
                        <div class="text-sm text-gray-600">작성자 {{ data.writer_no }} &nbsp; 작성일 {{ data.approval_date }}</div>
                    </div>

                    <div v-if="data.approval === 'a2'" class="border-b py-2 mb-2">
                        <span class="mr-2 font-medium">반려사유</span>
                    </div>
                    <div v-if="data.approval === 'a2'" class="border-b py-2 mb-2">
                        <span>{{ data.reason_rejection }}</span>
                    </div>
            </div>
        </div>
    </div>
</template>
