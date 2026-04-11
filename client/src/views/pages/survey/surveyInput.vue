<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useUserStore } from '@/stores/user';
import SurveyHistoryModal from '@/components/dialog/survey_dialog.vue';

const userStore = useUserStore();
const user_no = userStore.user_no;

const dropdownValues = ref([]);
const question = ref([]);

const dropdownValue = ref(null);
const beneficiarieNo = ref(null);
const currentSurveyNo = ref(null);

const info = ref([
    {
        disability_type: '',
        gender: '',
        birth: ''
    }
]);

const handleChange = async (e) => {
    beneficiarieNo.value = e.value.beneficiaries_no;

    await fetch(`/api/beneficiariesInfo/${beneficiarieNo.value}`)
        .then((resp) => resp.json())
        .then((data) => {
            info.value = data;
        })
        .catch((err) => console.log(err));

    console.log('현재 값:', beneficiarieNo.value);
};

const questionList = async () => {
    try {
        const resp = await fetch(`/api/surveyQuestion`);
        const data = await resp.json();
        question.value = data;
        console.log(question.value);
    } catch {
        (err) => console.log(err);
    }
};

const surveyForm = async () => {
    console.log(beneficiarieNo.value);
    let data = {
        beneficiaries_no: beneficiarieNo.value
    };
    console.log(data);
    const res = await fetch(`/api/createSurvey`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch((err) => console.log(err));
    const result = await res.json();
    const survey_no = result.result.insertId;
    console.log('생성된 survey_no:', result.result.insertId);
    currentSurveyNo.value = survey_no;
    console.log('넣은 survey_no:', currentSurveyNo.value);

    questionList();
};
const historyDialog = ref(false);
const selectedSurveyNo = ref(null);

const openHistoryModal = (surveyNo) => {
    selectedSurveyNo.value = surveyNo;
    historyDialog.value = true;
};

const addUSurveyInput = async () => {
    const data = question.value.flatMap((main) =>
        (main.subs ?? []).flatMap((sub) =>
            (sub.questions ?? []).map((q) => ({
                survey_no: currentSurveyNo.value,
                question_no: q.question_no,
                choice_value: q.answer
            }))
        )
    );

    const unansweredQuestions = data.filter((q) => q.choice_value === null || q.choice_value === undefined || q.choice_value === '');

    if (unansweredQuestions.length > 0) {
        alert('답변하지 않은 문항이 있습니다. 모든 문항에 답변해주세요.');
        return;
    } else {
        console.log('전송 data:', data);

        let result = await fetch(`/api/createSurveyInput`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch((err) => console.log(err));
        openHistoryModal(currentSurveyNo.value);
    }
};

console.log(user_no);
console.log(dropdownValues);
onBeforeMount(() => {
    fetch(`/api/beneficiariesList/${user_no}`)
        .then((resp) => resp.json())
        .then((data) => {
            dropdownValues.value = data;
        })
        .catch((err) => console.log(err));
});
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8 mt-6 h-full">
        <div class="md:w-1/5">
            <div class="h-9/10">
                <div class="font-semibold text-xl mb-4">지원자 정보 입력</div>
                <div>
                    <label for="user_name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">이름</label>
                    <Select v-model="dropdownValue" :options="dropdownValues" optionLabel="beneficiaries_name" placeholder="지원자 선택하기" @change="handleChange" />
                </div>
                <div>
                    <label for="disability_type" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">장애유형</label>
                    <InputText id="disability_type" class="w-full mb-8" v-model="info[0].disability_type" disabled />
                </div>

                <div>
                    <div class="md:w-1/2">
                        <label for="gender" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">성별</label>
                        <InputText id="gender" class="w-full mb-8" v-model="info[0].gender_name" disabled />
                    </div>
                    <div class="md:w-1/2">
                        <label for="birth" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">생년월일</label>
                        <InputText id="birth" class="w-full mb-8" v-model="info[0].birth" disabled />
                    </div>
                </div>
                <Button label="지원신청하기" class="w-full md:w-[8.5rem] mb-8" v-on:click="surveyForm()" :disabled="info[0]?.is_finish == 'N'"></Button>
            </div>
        </div>
        <div class="md:w-4/5">
            <div class="h-9/10">
                <div class="font-semibold text-xl mb-4">지원신청하기</div>
                <div v-if="info[0].is_finish == 'N'" class="font-semibold text-xl mb-4">종결이 안된 지원신청내역이 있습니다.</div>
                <div v-if="info[0].is_finish != 'N'" class="card h-full flex flex-col gap-4 overflow-y-auto">
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
                                <Column header="예" style="min-width: 1rem">
                                    <template #body="{ data }">
                                        <div class="flex items-center">
                                            <RadioButton :name="`option_${data.question_no}`" value="b1" v-model="data.answer" />
                                        </div>
                                    </template>
                                </Column>
                                <Column header="아니요" style="min-width: 1rem">
                                    <template #body="{ data }">
                                        <div class="flex items-center">
                                            <RadioButton :name="`option_${data.question_no}`" value="b2" v-model="data.answer" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                    <div class="mt-auto flex justify-end gap-2">
                        <Button type="button" class="w-24" @click="addUSurveyInput" >저장 후<br>미리보기</Button>
                        <SurveyHistoryModal v-model:visible="historyDialog" :surveyNo="selectedSurveyNo" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
