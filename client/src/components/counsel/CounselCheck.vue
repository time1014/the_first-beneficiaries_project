<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useBeneStore } from '@/stores/surBene';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userbeneStore = useBeneStore();
const route = useRoute();

const historyDialog = ref(false);
const historyData = ref([]);

const selectNo = Number(route.params.no);
const list = ref([]);
const managerNo = ref([]);
const subManagerNo = ref([]);
const surNo = computed(() => {
    return userbeneStore.survey_no;
});

const userNo = userStore.user_no;
const beneName = userbeneStore.beneficiaries_name;

const counsel = async () => {
    await fetch(`/api/counsel/${surNo.value}`)
        .then((resp) => resp.json())
        .then((data) => {
            console.log(managerNo.value);
            console.log(userbeneStore.manager_no);
            console.log(userbeneStore.subManager_no);
            console.log(subManagerNo.value);
            list.value = (Array.isArray(data) ? data : [data]).map((item) => ({
                ...item,
                filename: item.filename ? item.filename.split(',') : [],
                isEditing: false,
                isYourUpdate: userNo === managerNo.value || userNo === subManagerNo.value, //가져온거 체크
                isYourDel: item.wNo === userNo
            }));
        });
};

//수정버튼 담당 부담당자만 할수 있게 하기 위해 번호 가져옴
const beneInfo = async () => {
    await fetch(`/api/beneficiaries/${selectNo}`)
        .then((resp) => resp.json())
        .then((data) => {
            managerNo.value = data[0].manager_no;
            subManagerNo.value = data[0].sub_manager_no;
            console.log('담당', managerNo.value);
            console.log('부담당', subManagerNo.value);
        });
};

//수정할 해당 값 피니아에 넣음 + 폼 수정모드 전환
const handleClick = (item) => {
    userbeneStore.selectedCounsel = item;
    userbeneStore.isEditMode = true;

    window.dispatchEvent(new Event('counsel-edit-mode'));
};

//수정이력
const counselHistory = async (no) => {
    await fetch(`/api/counselHistory/${no}`)
        .then((resp) => resp.json())
        .then((data) => {
            historyData.value = data;
            historyDialog.value = true;
        });
};

//삭제
const counselDelete = async (no) => {
    if (confirm('정말 삭제하시겠습니까?') == true) {
        await fetch(`/api/counselDelete/${no}`, {
            method: 'delete'
        });
        await counsel();
    }
};

//변경감지시 재로딩
watch(
    () => userbeneStore.refreshCounsel,
    async () => {
        await counsel();
    }
);

onBeforeMount(async () => {
    await userbeneStore.fetchUsers(selectNo);
    await beneInfo();
    await counsel();
});
</script>

<template>
    <div class="card md:h-12/19 flex flex-col gap 4">
        <div class="overflow-y-auto">
            <div class="font-bold text-lg mb-2 border-b pb-2">상담기록 조회</div>
            <div v-if="list.length === 0" class="text-center text-gray-500 py-10">등록된 상담기록이 없습니다.</div>
            <div v-else></div>
            <div v-for="(item, index) in list" :key="index" class="mb-6 border-b pb-4">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <div class="font-semibold" :data-no="item.no">상담기록 {{ index + 1 }}</div>

                        <div class="text-sm text-gray-600">작성자 {{ item.name }} &nbsp; 작성일 {{ item.created_at }}</div>
                    </div>

                    <div class="border-t border-b py-2 mb-2">
                        <span class="mr-2 font-medium">제목</span>
                        <span v-if="!item.isEditing">{{ item.title }}</span>
                    </div>

                    <div class="border-b py-2 mb-2">
                        <span class="mr-2 font-medium">내용</span>
                        <span v-if="!item.isEditing">{{ item.content }}</span>
                    </div>

                    <div class="border-b py-2 mb-2">
                        <span class="mr-2 font-medium">첨부 파일</span>

                        <div v-for="(file, i) in item.filename" :key="i">
                            <a :href="`/api/download/${encodeURIComponent(file)}`">
                                {{ file }}
                            </a>
                        </div>
                        <div v-if="item.isEditing" class="mt-2"></div>
                    </div>

                    <div class="py-2">
                        <span class="mr-2 font-medium">상담일자</span>
                        <span>{{ item.counseldate }}</span>
                    </div>
                </div>
                <div class="mt-auto flex justify-end gap-2">
                    <Button type="submit" label="수정이력" class="w-24" @click="counselHistory(item.no)" />
                    <Button type="button" class="w-24" v-if="item.isYourUpdate" label="수정" @click="handleClick(item)" />
                    <Button type="submit" label="삭제" v-if="item.isYourDel" class="w-24" severity="danger" @click="counselDelete(item.no)" />
                </div>
            </div>
        </div>
        <Dialog v-model:visible="historyDialog" :modal="true" :closable="false" :dismissableMask="true" :style="{ width: '50vw' }">
            <template #header>
                <div class="w-full bg-indigo-500 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                    <span class="text-lg font-medium"> {{ beneName }}님 상담기록에 대한 수정이력 </span>

                    <button @click="historyDialog = false" class="text-white text-2xl font-light hover:opacity-70">✕</button>
                </div>
            </template>

            <!-- 내용 -->
            <div v-if="historyData.length === 0" class="text-center py-10 text-gray-400">수정이력 없음</div>

            <div v-else class="px-4 py-6">
                <table class="w-full text-center border-collapse">
                    <thead>
                        <tr class="border-t-2 border-b-2 border-gray-400">
                            <th class="py-3">수정날짜</th>
                            <th class="py-3">작성자</th>
                            <th class="py-3">권한</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="item in historyData" :key="item.id" class="border-b border-gray-400 h-12 hover:bg-gray-50">
                            <td>{{ item.created_at }}</td>
                            <td>{{ item.writer }}</td>
                            <td>{{ item.role }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Dialog>
    </div>
</template>
