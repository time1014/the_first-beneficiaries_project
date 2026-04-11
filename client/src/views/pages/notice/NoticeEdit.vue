<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const noticeNo = route.params.noticeNo;

const notice = ref({
    notice_title: '',
    notice_content: '',
    institution_no: null,
    user_name: '',
    created_at: '',
    files: []
});

const dropdownValues = ref([]);
const newFiles = ref([]);
const delFileNos = ref([]);

// 날짜포맷
const dateFormat = (dateVal) => {
    let newDate = new Date(dateVal);
    let year = newDate.getFullYear();
    let month = ('0' + (newDate.getMonth() + 1)).slice(-2);
    let day = ('0' + newDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

// 공지사항 상세조회
const getNoticeDetail = async () => {
    try {
        const res = await fetch(`/api/notice/detail/${noticeNo}`);
        const data = await res.json();

        notice.value = {
            ...data,
            institution_no: data.institution_no || null,
            files: data.files || []
        };
    } catch (err) {
        console.log(err);
    }
};

// 새 첨부파일 선택
const handleFileChange = (e) => {
    // FileList는 배열이 아니므로 Array.from()으로 배열 변환
    const selectedFiles = Array.from(e.target.files);
    // 기존에 선택된 새 파일 목록 + 이번에 새로 선택한 파일 목록 합치기
    newFiles.value = [...newFiles.value, ...selectedFiles];
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    e.target.value = '';
};

// 기존 등록 파일 삭제
const removeOldFile = (fileNo) => {
    // 삭제할 파일 번호 배열에 추가
    delFileNos.value.push(fileNo);
    // 화면에서도 즉시 제거되도록 기존 파일 목록에서 해당 파일 제외
    notice.value.files = notice.value.files.filter((file) => file.file_no !== fileNo);
};

// 새 첨부파일 삭제
// 아직 서버에 업로드되지 않은 새 파일을 화면 목록에서 제거하는 함수
const removeNewFile = (index) => {
    // 배열에서 해당 인덱스의 파일 제거
    newFiles.value.splice(index, 1);
};

// 공지사항 수정
const updateNotice = async () => {
    if (!notice.value.notice_title || !notice.value.notice_content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    // 시스템관리자는 기관 선택 필수
    if (userStore.role === 'e4' && !notice.value.institution_no) {
        alert('기관을 선택하세요.');
        return;
    }

    try {
        const formData = new FormData();

        formData.append('notice_title', notice.value.notice_title);
        formData.append('notice_content', notice.value.notice_content);
        formData.append('user_no', userStore.user_no);

        // 시스템관리자만 기관 수정
        if (userStore.role === 'e4') {
            formData.append('institution_no', notice.value.institution_no);
        }

        // 삭제할 기존 파일 번호 배열
        formData.append('delete_file_nos', JSON.stringify(delFileNos.value));

        // 새 파일들 추가
        for (let i = 0; i < newFiles.value.length; i++) {
            formData.append('files', newFiles.value[i]);
        }

        const res = await fetch(`/api/notice/detail/${noticeNo}`, {
            method: 'PUT',
            body: formData
        });

        const data = await res.json();

        if (data.result?.status || data.status) {
            alert('공지사항이 수정되었습니다.');
            goToDetail();
        } else {
            alert('공지사항 수정에 실패했습니다.');
        }
    } catch (err) {
        console.log(err);
    }
};

// 상세조회로 돌아가기
const goToDetail = () => {
    router.push(`/notice/info/${noticeNo}`);
};

onMounted(async () => {
    if (userStore.role === 'e4') {
        await getInstitutionList();
    }
    await getNoticeDetail();
});
</script>
<template>
    <div class="card border-none bg-transparent p-0">
        <div class="text-xl font-bold mb-4 ml-1">글 수정하기</div>
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
            <div class="label-box">작성자</div>
            <div class="flex-1 p-3 border-1 surface-border border-round-md bg-gray-100 text-gray-600">
                {{ notice.user_name }}
            </div>
        </div>
        <div class="flex mb-3">
            <div class="label-box">작성일</div>
            <div class="flex-1 p-3 border-1 surface-border border-round-md bg-gray-100 text-gray-600">
                {{ dateFormat(notice.created_at) }}
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
            <div class="flex-1 p-3 border-1 surface-border border-round-md bg-white">
                <div v-if="notice.files.length > 0" class="mb-3">
                    <div class="text-sm font-bold text-blue-500 mb-2">기존 첨부파일</div>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="file in notice.files" :key="file.file_no" class="flex align-items-center bg-white border-1 surface-border border-round-md px-3 py-2 text-sm shadow-sm">
                            <span class="mr-2">{{ file.file_name }}</span>
                            <i class="pi pi-times-circle text-red-500 cursor-pointer hover:text-red-700" @click="removeOldFile(file.file_no)"></i>
                        </div>
                    </div>
                </div>
                <div v-if="newFiles.length > 0" class="mb-3">
                    <div class="text-sm font-bold text-green-500 mb-2">새로 추가한 파일</div>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="(file, index) in newFiles" :key="index" class="flex align-items-center bg-white border-1 surface-border border-round-md px-3 py-2 text-sm shadow-sm">
                            <span class="mr-2">{{ file.name }}</span>
                            <i class="pi pi-times-circle text-red-500 cursor-pointer hover:text-red-700" @click="removeNewFile(index)"></i>
                        </div>
                    </div>
                </div>
                <label for="file-upload" class="p-button p-button-outlined p-button-secondary border-round-md px-4 py-2 cursor-pointer inline-flex align-items-center">
                    <i class="pi pi-plus mr-2"></i>
                    파일 추가
                </label>
                <input id="file-upload" type="file" multiple @change="handleFileChange" style="display: none" />
            </div>
        </div>

        <div class="flex justify-end mt-3 gap-2">
            <Button label="취소" class="p-button-secondary px-5 py-2 font-bold" @click="goToDetail" />
            <Button label="수정완료" @click="updateNotice" />
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
