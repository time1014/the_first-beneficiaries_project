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
    visible: Boolean
});

const question = ref([]);

onBeforeMount(async () => {
    const resp = await fetch(`/api/surveyQuestion`);
    question.value = await resp.json();
});
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
        <div class="card h-full flex flex-col gap-4 overflow-y-auto">
            <div v-for="mainItem in question" :key="mainItem.main_no">
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
    </Dialog>
</template>
