<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const ins_no = userStore.institution;

const managerList = ref([]);
const selectedUser = ref(null);

const isEditMode = ref(false);
const isCreateMode = ref(false);

const insList = ref([]);

// 입력폼
const form = reactive({
    user_id: '',
    password: '',
    name: '',
    tel: '',
    email: '',
    ins_no: ''
});

// 담당자 리스트 조회
const managerFetch = async (ins_no) => {
    try {
        const resp = await fetch(`/api/managerList/${ins_no}`);
        const data = await resp.json();
        managerList.value = data;

        if (!selectedUser.value && data.length > 0) {
            selectedUser.value = data[0];
            loadForm(selectedUser.value);
        }
    } catch (err) {
        console.error('담당자 조회 에러:', err);
    }
};

//기관정보 조회
const fetchInsList = async () => {
    try {
        const resp = await fetch('/api/institutionList');
        const data = await resp.json();
        insList.value = data;
    } catch (err) {
        console.error('기관 목록 조회 에러:', err);
    }
};

//담당자 선택시 조회 모드 전환
const selectUser = (user) => {
    selectedUser.value = user;
    loadForm(user);
    isEditMode.value = false;
    isCreateMode.value = false;
};

//상세정보 불러옴
const loadForm = (user) => {
    if (!user) return;
    form.user_id = user.user_id || '';
    form.name = user.name || '';
    form.tel = user.tel || '';
    form.email = user.email || '';
    form.ins_no = user.ins_no ? String(user.ins_no) : '';
};

//등록 모드 전환
const createUser = () => {
    isCreateMode.value = true;
    isEditMode.value = false;
    selectedUser.value = null;

    form.user_id = '';
    form.password = '';
    form.name = '';
    form.tel = '';
    form.email = '';
    // form.ins_no = '';
};

//수정 모드 전환
const editUser = () => {
    isEditMode.value = true;
    isCreateMode.value = false;
};

//담당자 등록
const insertUser = async () => {
    try {
        const payload = {
            user_id: form.user_id,
            password: form.password,
            name: form.name,
            tel: form.tel,
            email: form.email,
            ins_no: ins_no
        };

        const resp = await fetch('/api/managerInsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('등록 실패');

        const newUser = await resp.json();

        alert('등록 완료');

        await managerFetch(ins_no);

        const latestUser = managerList.value[managerList.value.length - 1];

        selectedUser.value = latestUser;
        loadForm(latestUser);

        isCreateMode.value = false;
    } catch (err) {
        console.error('등록 에러:', err);
        alert('이미 사용중인 아이디');
    }
};

//수정후 저장
const saveUser = async () => {
    if (!selectedUser.value) return;

    const mNo = selectedUser.value.user_no;

    try {
        const payload = {
            user_id: form.user_id,
            name: form.name,
            tel: form.tel,
            email: form.email,
            ins_no: form.ins_no
        };

        const resp = await fetch(`/api/managerUpdate/${mNo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('저장 실패');

        await resp.json();

        alert('저장 완료');

        await managerFetch(ins_no);

        const updatedUser = managerList.value.find((u) => String(u.user_no) === String(mNo)); //담당자 리스트중 최근에 선택된 번호랑 같은 값 찾음

        if (updatedUser) {
            // 수정 끝난후 찾은 번호로 다시 조회
            selectedUser.value = updatedUser;
            loadForm(updatedUser);
        }

        isEditMode.value = false;
    } catch (err) {
        console.error('저장 에러:', err);
        alert('저장 실패');
    }
};

onBeforeMount(() => {
    managerFetch(ins_no);
    fetchInsList();
});
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8 h-full">
        <div class="md:w-2/8 h-full">
            <div class="card h-full flex flex-col gap-4 min-h-0">
                <div class="flex justify-between mb-4">
                    <h3>담당자 목록</h3>
                    <span>{{ managerList.length }}명</span>
                </div>

                <div class="flex-1 overflow-y-auto">
                    <div v-for="user in managerList" :key="user.user_id" class="p-3 border-b cursor-pointer hover:bg-gray-200" @click="selectUser(user)">
                        {{ user.name }}
                    </div>
                </div>

                <Button @click="createUser" class="w-full" label="기관담당자 등록" />
            </div>
        </div>

        <div class="md:w-6/8 h-full">
            <div class="card h-full flex flex-col gap-4">
                <h2 class="mb-6 text-xl">
                    {{ isCreateMode ? '담당자 등록' : isEditMode ? '담당자 정보 수정' : selectedUser?.name || '담당자 정보' }}
                </h2>

                <!-- 조회 -->
                <template v-if="!isEditMode && !isCreateMode">
                    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                        <div class="grid gap-3">
                            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200">
                                <div class="font-semibold text-surface-700">아이디</div>
                                <div class="text-surface-900">
                                    {{ selectedUser?.user_id }}
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200">
                                <div class="font-semibold text-surface-700">이름</div>
                                <div class="text-surface-900">
                                    {{ selectedUser?.name }}
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200">
                                <div class="font-semibold text-surface-700">전화번호</div>
                                <div class="text-surface-900">
                                    {{ selectedUser?.tel || '-' }}
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200">
                                <div class="font-semibold text-surface-700">이메일</div>
                                <div class="text-surface-900">
                                    {{ selectedUser?.email || '-' }}
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2">
                                <div class="font-semibold text-surface-700">기관</div>
                                <div class="text-surface-900">
                                    {{ insList.find((i) => String(i.ins_no) === String(selectedUser?.ins_no))?.ins_name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- 수정 -->
                <template v-else-if="isEditMode">
                    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                        <div class="grid gap-4">
                            <div>
                                <label class="block text-sm text-surface-600 mb-1">아이디</label>
                                <InputText v-model="form.user_id" :disabled="isEditMode" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm text-surface-600 mb-1">이름</label>
                                <InputText v-model="form.name" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm text-surface-600 mb-1">전화번호</label>
                                <InputText v-model="form.tel" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm text-surface-600 mb-1">이메일</label>
                                <InputText v-model="form.email" disabled class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm text-surface-600 mb-1">기관</label>
                                <InputText :value="insList.find((i) => String(i.ins_no) === String(isCreateMode ? ins_no : form.ins_no))?.ins_name" disabled class="w-full grayscale-input" />
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 등록 -->
                <template v-else>
                    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
                        <div class="space-y-4">
                            <div class="flex flex-col">
                                <label class="text-gray-500 text-sm mb-1">아이디</label>
                                <input v-model="form.user_id" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>

                            <div class="flex flex-col">
                                <label class="text-gray-500 text-sm mb-1">비밀번호</label>
                                <input type="password" v-model="form.password" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>

                            <div class="flex flex-col">
                                <label class="text-gray-500 text-sm mb-1">이름</label>
                                <input v-model="form.name" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>

                            <div class="flex flex-col">
                                <label class="text-gray-500 text-sm mb-1">전화번호</label>
                                <input v-model="form.tel" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>

                            <div class="flex flex-col">
                                <label class="text-gray-500 text-sm mb-1">이메일</label>
                                <input v-model="form.email" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>

                            <!-- <div class="flex flex-col">
                            <label class="text-gray-500 text-sm mb-1">기관</label>
                            <select v-model="form.ins_no" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300">
                                <option disabled value="">기관 선택</option>
                                <option v-for="ins in insList" :key="ins.ins_no" :value="String(ins.ins_no)">
                                    {{ ins.ins_name }}
                                </option>
                            </select>
                        </div> -->
                        </div>
                    </div>
                </template>

                <!-- 버튼 -->
                <div class="flex justify-end gap-2 mt-6">
                    <Button v-if="!isEditMode && !isCreateMode" label="수정" @click="editUser" />
                    <template v-if="isEditMode">
                        <Button label="취소" severity="secondary" outlined @click="isEditMode = !isEditMode" />
                        <Button label="저장" @click="saveUser" />
                    </template>

                    <Button v-if="isCreateMode" label="등록" @click="insertUser" />
                </div>
            </div>
        </div>
    </div>
</template>
