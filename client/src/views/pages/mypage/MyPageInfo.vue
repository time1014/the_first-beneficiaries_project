<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const uNo = userStore.user_no;
const uName = computed(() => userStore.user_name);

import { myInfo } from '@/service/MyPageService';

const myInfoList = ref([]);

// 수정 모드
const isEditMode = ref(false);

// 입력값 (수정용)
const editForm = ref({
    user_name: '',
    tel: ''
});

const form = reactive({
    zonecode: '',
    roadAddress: '',
    detailAddress: ''
});

const formdata = computed(() => {
    return form.zonecode + ' ' + form.roadAddress + ' ' + form.detailAddress;
});

function searchAddress() {
    if (!window.kakao || !window.kakao.Postcode) {
        alert('주소 검색 서비스를 불러오지 못했습니다.');
        return;
    }

    new window.kakao.Postcode({
        oncomplete(data) {
            form.zonecode = data.zonecode || '';
            form.roadAddress = data.roadAddress || data.address || '';

            const detailInput = document.getElementById('detailAddress');
            if (detailInput) detailInput.focus();
        }
    }).open();
}

// 데이터 불러오기
async function loadInfo(uNo) {
    const data = await myInfo(uNo);
    myInfoList.value = Array.isArray(data) ? data : [data];
}

// 수정 버튼 클릭
// 수정 버튼 클릭
function handleEdit() {
    isEditMode.value = true;

    editForm.value.user_name = myInfoList.value[0].user_name;
    editForm.value.tel = myInfoList.value[0].tel;
}

// 저장 버튼 클릭
async function handleSave() {
    console.log('수정값 : ', editForm.value.user_name, editForm.value.tel, formdata.value);

    try {
        await fetch(`/api/myPageInfo`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_no: uNo,
                user_name: editForm.value.user_name,
                tel: editForm.value.tel,
                address: formdata.value
            })
        });

        // 화면 반영
        myInfoList.value[0].user_name = editForm.value.user_name;
        myInfoList.value[0].tel = editForm.value.tel;
        myInfoList.value[0].address = formdata.value;

        userStore.updateUser({
            user_name: editForm.value.user_name,
            role: userStore.role
        });

        const loginUser = JSON.parse(localStorage.getItem('user')) || {};
        loginUser.user_name = editForm.value.user_name;
        localStorage.setItem('user', JSON.stringify(loginUser));

        isEditMode.value = false;
        alert('수정 완료');
        window.location.reload();
    } catch (err) {
        console.error(err);
        alert('수정 실패');
    }
}

onMounted(async () => {
    await loadInfo(uNo);
});
</script>

<template>
    <div class="p-6 rounded">
        <div class="text-lg font-semibold mb-4 border-b pb-2">보호자 {{ uName }} 정보</div>
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
            <div v-if="myInfoList[0]" class="divide-y">
                <!-- 아이디 -->
                <div class="grid grid-cols-4 py-4">
                    <div>아이디</div>
                    <div class="col-span-3">{{ myInfoList[0].user_id }}</div>
                </div>

                <!-- 이름 -->
                <div class="grid grid-cols-4 py-4">
                    <div>이름</div>
                    <div class="col-span-3">
                        <input v-if="isEditMode" v-model="editForm.user_name" class="border px-2 py-1 rounded w-full" />
                        <span v-else>{{ myInfoList[0].user_name }}</span>
                    </div>
                </div>

                <!-- 전화번호 -->
                <div class="grid grid-cols-4 py-4">
                    <div>전화번호</div>
                    <div class="col-span-3">
                        <input v-if="isEditMode" v-model="editForm.tel" class="border px-2 py-1 rounded w-full" />
                        <span v-else>{{ myInfoList[0].tel }}</span>
                    </div>
                </div>

                <!-- 이메일 -->
                <div class="grid grid-cols-4 py-4">
                    <div>이메일</div>
                    <div class="col-span-3">{{ myInfoList[0].email }}</div>
                </div>

                <!-- 주소 -->
                <div class="grid grid-cols-4 py-4">
                    <div>주소</div>
                    <div class="col-span-3">
                        <!-- 수정모드 -->
                        <div v-if="isEditMode">
                            <div class="flex gap-2 mb-2">
                                <input v-model="form.zonecode" placeholder="우편번호" readonly class="border px-2 py-1 w-32" />
                                <button @click="searchAddress" class="bg-gray-300 px-2 rounded">검색</button>
                            </div>

                            <input v-model="form.roadAddress" placeholder="기본주소" readonly class="border px-2 py-1 w-full mb-2" />
                            <input id="detailAddress" v-model="form.detailAddress" placeholder="상세주소" class="border px-2 py-1 w-full" />
                        </div>

                        <!-- 일반모드 -->
                        <span v-else>
                            {{ myInfoList[0].address }}
                        </span>
                    </div>
                </div>
                <!-- 기관 -->
                <div class="grid grid-cols-4 py-4">
                    <div>기관</div>
                    <div class="col-span-3">{{ myInfoList[0].ins }}</div>
                </div>

                <!-- 가입일 -->
                <div class="grid grid-cols-4 py-4">
                    <div>가입일</div>
                    <div class="col-span-3">{{ myInfoList[0].created_at }}</div>
                </div>
            </div>
        </div>
        <!-- 버튼 -->
        <div class="flex justify-end mt-6 gap-3">
            <Button v-if="!isEditMode" @click="handleEdit" label="수정" class="w-24" />
            <Button v-else @click="handleSave" label="저장" class="w-24" />

            <!-- <button class="bg-gray-300 px-4 py-2 rounded">회원탈퇴</button>

            <button v-if="!isEditMode" @click="handleEdit" class="bg-green-500 text-white px-4 py-2 rounded">수정</button>

            <button v-else @click="handleSave" class="bg-blue-500 text-white px-4 py-2 rounded">저장</button> -->
        </div>
    </div>
</template>
