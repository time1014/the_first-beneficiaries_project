<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const notice = ref({
    notice_title: '',
    notice_content: '',
    institution_no: null
});

const files = ref([]);
const dropdownValues = ref([]);

// 파일 선택
const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    files.value = [...files.value, ...selectedFiles];
};

// 파일 삭제
const removeFile = (index) => {
    files.value.splice(index, 1);
};

// 기관 목록 조회
const getInstitutionList = async () => {
    try {
        const res = await fetch('/api/institution');
        const data = await res.json();
        dropdownValues.value = data;
    } catch (err) {
        console.log(err);
    }
};

// 공지사항 등록
const createNotice = async () => {
    try {
        // 시스템관리자는 기관 선택 필수!
        if (userStore.role === 'e4' && !notice.value.institution_no) {
            alert('기관을 선택해주세요.');
            return;
        }

        const formData = new FormData();

        formData.append('notice_title', notice.value.notice_title);
        formData.append('notice_content', notice.value.notice_content);
        formData.append('user_no', userStore.user_no);

        // 시스템관리자는 선택한 기관, 그 외는 본인 기관 자동 저장
        const institutionNo = userStore.role === 'e4' ? notice.value.institution_no : userStore.institution;
        formData.append('institution_no', institutionNo);

        // 파일 여러 개
        for (let i = 0; i < files.value.length; i++) {
            formData.append('files', files.value[i]);
        }

        const res = await fetch('/api/notice', {
            method: 'POST',
            body: formData
        });

        await res.json();
        router.push('/notice');
    } catch (err) {
        console.log(err);
    }
};

// 목록으로 이동
const goToList = () => {
    router.push('/notice');
};

onBeforeMount(() => {
    // 시스템관리자(e4)일 때만 기관 목록 조회
    if (userStore.role === 'e4') {
        getInstitutionList();
    }
});
</script>

<template>
    <div class="card border-none bg-transparent p-0">
        <div class="text-xl font-bold mb-4 ml-1">글 등록하기</div>
        <div class="flex mb-3" v-if="userStore.role === 'e4'">
            <div class="label-box">기관</div>
            <div class="flex-1">
                <Select v-model="notice.institution_no" :options="dropdownValues" optionLabel="institution_name" optionValue="institution_no" placeholder="기관 선택" class="w-full" />
            </div>
        </div>
        <div class="flex mb-3">
            <div class="label-box">제목</div>
            <div class="flex-1">
                <InputText v-model="notice.notice_title" class="w-full h-full border-round-md" placeholder="제목을 입력하세요" />
            </div>
        </div>
        <div class="flex mb-3">
            <div class="label-box">공지내용</div>
            <div class="flex-1">
                <Textarea v-model="notice.notice_content" rows="10" class="w-full border-round-md block" style="resize: none" placeholder="내용을 입력하세요" />
            </div>
        </div>
        <div class="flex mb-4">
            <div class="label-box">첨부파일</div>
            <div class="flex-1 p-3 border-1 surface-border border-round-md bg-white flex align-items-center">
                <div v-if="!files.length">
                    <label for="file-upload" class="p-button p-button-outlined p-button-secondary border-round-md px-4 py-2 cursor-pointer flex align-items-center"> 첨부파일 </label>
                </div>
                <div v-else class="flex flex-wrap align-items-center gap-2">
                    <span class="text-sm font-bold text-green-500 mr-2 flex align-items-center"> <i class="pi pi-paperclip mr-1"></i> 총 {{ files.length }}개 파일 </span>
                    <div v-for="(file, index) in files" :key="index" class="flex align-items-center bg-white border-1 surface-border border-round-md px-3 py-2 text-sm shadow-sm">
                        <span class="mr-2">{{ file.name }}</span>
                        <i class="pi pi-times-circle text-red-500 cursor-pointer hover:text-red-700" @click="removeFile(index)"></i>
                    </div>
                    <label for="file-upload" class="p-button p-button-sm p-button-outlined p-button-secondary border-round-md px-3 py-2 cursor-pointer ml-1"> <i class="pi pi-plus mr-1"></i> 추가 </label>
                </div>

                <input id="file-upload" type="file" multiple @change="handleFileChange" style="display: none" />
            </div>
        </div>
        <div class="flex justify-end gap-2 mt-3">
            <Button label="취소" severity="secondary" @click="goToList" />
            <Button label="글등록" @click="createNotice" />
        </div>
    </div>
</template>

<style scoped>
.label-box {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    margin-right: 12px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
