<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    surveyNo: Number,
    institutionNo: Number
});

const emit = defineEmits(['assigned']);

const managerList = ref([]);
const managerNo = ref('');
const subManagerNo = ref('');

// 담당자 목록 조회
const managerFetch = async () => {
    try {
        // institutionNo가 없으면 조회하지 않음
        if (!props.institutionNo) {
            managerList.value = [];
            return;
        }

        const resp = await fetch(`/api/managerAssign/managerList/${props.institutionNo}`);
        const data = await resp.json();
        managerList.value = data;
    } catch (err) {
        console.error('담당자 목록 조회 실패:', err);
    }
};

// institutionNo가 처음 들어오거나 변경될 때 담당자 목록 다시 조회
watch(
    () => props.institutionNo,
    (newValue) => {
        if (newValue) {
            managerFetch();
        } else {
            managerList.value = [];
        }
    },
    { immediate: true }
);

// 담당자 지정 저장
const saveAssign = async () => {
    try {
        if (!managerNo.value) {
            alert('본담당자를 선택해주세요.');
            return;
        }

        if (managerNo.value && subManagerNo.value && managerNo.value === subManagerNo.value) {
            alert('본담당자와 부담당자는 다르게 선택해주세요.');
            return;
        }

        const resp = await fetch('/api/managerAssign/assign', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                survey_no: props.surveyNo,
                manager_no: managerNo.value,
                sub_manager_no: subManagerNo.value || null
            })
        });

        const data = await resp.json();

        if (resp.ok) {
            alert('담당자 지정이 완료되었습니다.');

            emit('assigned', {
                manager_no: managerNo.value,
                sub_manager_no: subManagerNo.value || null
            });
        } else {
            alert(data.message || '담당자 지정 실패');
        }
    } catch (err) {
        console.error('담당자 지정 저장 실패:', err);
    }
};
</script>

<template>
    <div class="bg-white p-8 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-6">담당자 / 부담당자 지정</h2>

        <div class="space-y-4">
            <div class="flex justify-between items-center border-b pb-3">
                <span class="text-gray-500">조사지 번호</span>
                <span>{{ props.surveyNo }}</span>
            </div>

            <div class="flex justify-between items-center border-b pb-3">
                <span class="text-gray-500">본담당자</span>
                <select v-model="managerNo" class="w-64 border rounded px-3 py-2">
                    <option value="">선택하세요</option>
                    <option v-for="user in managerList" :key="user.user_no" :value="user.user_no">
                        {{ user.name }}
                    </option>
                </select>
            </div>

            <div class="flex justify-between items-center border-b pb-3">
                <span class="text-gray-500">부담당자</span>
                <select v-model="subManagerNo" class="w-64 border rounded px-3 py-2">
                    <option value="">선택하세요</option>
                    <option v-for="user in managerList" :key="user.user_no" :value="user.user_no">
                        {{ user.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="flex justify-end mt-6">
            <!-- <button class="bg-green-400 text-white px-6 py-2 rounded-full" @click="saveAssign">저장</button> -->
            <Button type="submit" label="저장" @click="saveAssign" />
        </div>
    </div>
</template>
