<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const emit = defineEmits(['update:visible']);

const userStore = useUserStore();
const user_no = userStore.user_no;
const userbeneStore = useBeneStore();
const props = defineProps({
    visible: Boolean,
    surveyNo: Number
});

const question = ref([]);

const loadSurveyQuestion = async () => {
    const resp = await fetch(`/api/surveyQuestion/${props.surveyNo}`);
    question.value = await resp.json();
};

watch(
    () => [props.visible, props.surveyNo],
    async ([visible, surveyNo]) => {
        if (visible && surveyNo) {
            await loadSurveyQuestion();
        }
    }
);
</script>
<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '50vw' }">
        <template #header>
            <div class="w-full bg-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                <span class="text-lg font-medium"> 조사지 </span>

                <button @click="emit('update:visible', false)" class="text-white text-2xl font-light hover:opacity-70">✕</button>
            </div>
        </template>

        <!-- 내용 -->
        <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name == null" class="font-semibold text-l mb-4">지원신청내역이 없습니다.</div>
        <div class="card h-full flex flex-col gap-4 overflow-y-auto">
            <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name != null" class="text-sm text-gray-600">작성일 {{ question[0]?.created_at }}</div>
            <div v-if="question[0]?.subs?.[0]?.questions?.[0]?.answer_name != null" v-for="mainItem in question" :key="mainItem.main_no">
                <div v-for="subItem in mainItem.subs" :key="subItem.sub_no">
                    <span v-if="subItem.sub_title != null" class="text-xl font-bold text-surface-900 dark:text-surface-0">
                        {{ mainItem.main_title }}
                    </span>

                    <span v-if="question[0]?.subs?.[0]?.questions?.[0]?.question_text != null" class="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
                        {{ subItem.sub_title }}
                    </span>

                    <DataTable :value="subItem.questions" dataKey="question_no" :rowHover="true" showGridlines>
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
    </Dialog>
</template>
