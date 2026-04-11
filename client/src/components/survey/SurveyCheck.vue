<script setup>
import { onBeforeMount, ref } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';

const userbeneStore = useBeneStore();
const route = useRoute();
const selectNo = Number(route.params.no);

const question = ref([]);

onBeforeMount(async () => {
    try {
        const resp = await fetch(`/api/surveyQuestion/${selectNo}`);
        const data = await resp.json();
        question.value = data;
        console.log(question.value);
    } catch {
        (err) => console.log(err);
    }
    console.log(question.value[0]?.subs[0]?.questions[0]?.answer_name);
});
</script>

<template>
    <div class="card md:h-12/19 flex flex-col gap 4">
        <div class="font-semibold text-xl mb-4">지원신청서</div>

        <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name == null" class="font-semibold text-l mb-4">지원신청내역이 없습니다.</div>
        <div class="card h-full flex flex-col gap-4 overflow-y-auto">
            <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name != null" class="text-sm text-gray-600">작성일 {{ question[0]?.created_at }}</div>
            <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name != null" v-for="mainItem in question" :key="mainItem.main_no">
                <div v-for="subItem in mainItem.subs" :key="subItem.sub_no">
                    <span class="text-xl font-bold text-surface-900 dark:text-surface-0">
                        {{ mainItem.main_title }}
                    </span>

                    <span class="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
                        {{ subItem.sub_title }}
                    </span>

                    <DataTable :value="subItem.questions" dataKey="question_no" :rowHover="true" showGridlines>
                        <template #empty>데이터를 못 찾았습니다. </template>

                        <Column header="질문" style="min-width: 40rem">
                            <template #body="{ data }">
                                <div>
                                    <span>{{ data.question_text }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column header="답변" style="min-width: 1rem">
                            <template #body="{ data }">
                                <div>
                                    <span>{{ data.answer_name }}</span>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
