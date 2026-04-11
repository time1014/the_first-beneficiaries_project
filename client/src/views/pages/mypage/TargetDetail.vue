<script setup>
import { reactive, ref, watch } from 'vue';

const props = defineProps({
    // 현재 선택된 대상자
    target: { type: Object, default: null },

    // 신규 등록 모드 여부
    isCreateMode: { type: Boolean, default: false }
});

const emit = defineEmits(['updated', 'created']);

// 현재 화면 모드
// view = 보기
// edit = 수정
// create = 신규 등록
const mode = ref('view');

// 입력/표시용 폼 데이터
const form = reactive({
    id: null,
    name: '',
    birth: '',
    phone: '',
    gender: '',
    address: '',
    zonecode: '',
    roadAddress: '',
    detailAddress: '',
    disability_type: '',
    relation: '',
    created_at: ''
});

// 날짜 문자열 자르기
function formatDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

// 성별 코드 표시용
function getGenderLabel(code) {
    if (code === 'c1') return '남자';
    if (code === 'c2') return '여자';
    return code || '';
}

// 폼 초기화
function resetForm() {
    form.id = null;
    form.name = '';
    form.birth = '';
    form.phone = '';
    form.gender = '';
    form.address = '';
    form.zonecode = '';
    form.roadAddress = '';
    form.detailAddress = '';
    form.disability_type = '';
    form.relation = '';
    form.created_at = '';
}

// 저장된 전체 주소를 우편번호 / 기본주소 / 상세주소용으로 나누기
function splitAddress(fullAddress) {
    if (!fullAddress) {
        form.zonecode = '';
        form.roadAddress = '';
        form.detailAddress = '';
        return;
    }

    const text = String(fullAddress).trim();
    const zoneMatch = text.match(/^\((\d{5})\)\s*/);

    if (zoneMatch) {
        form.zonecode = zoneMatch[1];
        form.roadAddress = text.replace(/^\(\d{5}\)\s*/, '');
        form.detailAddress = '';
    } else {
        form.zonecode = '';
        form.roadAddress = text;
        form.detailAddress = '';
    }
}

// 신규 등록 모드가 되면 create 모드 + 초기화
watch(
    () => props.isCreateMode,
    (isCreateMode) => {
        if (isCreateMode) {
            mode.value = 'create';
            resetForm();
        }
    },
    { immediate: true }
);

// 부모에서 target이 바뀌면 상세값 다시 세팅
watch(
    () => props.target,
    (target) => {
        if (!props.isCreateMode && target) {
            mode.value = 'view';
            form.id = target.id;
            form.name = target.name || '';
            form.birth = formatDate(target.birth);
            form.phone = target.phone || '';
            form.gender = target.gender || '';
            form.address = target.address || '';
            splitAddress(target.address || '');
            form.disability_type = target.disability_type || '';
            form.relation = target.relation || '';
            form.created_at = formatDate(target.created_at);
        }
    },
    { immediate: true }
);

// 수정 모드 진입
function editMode() {
    mode.value = 'edit';
}

// 수정 취소
function cancelEdit() {
    if (props.isCreateMode) {
        resetForm();
        return;
    }

    if (props.target) {
        mode.value = 'view';
        form.id = props.target.id;
        form.name = props.target.name || '';
        form.birth = formatDate(props.target.birth);
        form.phone = props.target.phone || '';
        form.gender = props.target.gender || '';
        form.address = props.target.address || '';
        splitAddress(props.target.address || '');
        form.disability_type = props.target.disability_type || '';
        form.relation = props.target.relation || '';
        form.created_at = formatDate(props.target.created_at);
    }
}

// 주소 검색
// 현재는 네 기존 구조 유지
// 주소검색이 안 되면 여기만 window.daum.Postcode 로 바꾸면 됨
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

// 저장용 최종 주소 만들기
function makeFinalAddress() {
    return [form.zonecode ? `(${form.zonecode})` : '', form.roadAddress, form.detailAddress].filter(Boolean).join(' ').trim();
}

// 필수값 검사
function validateForm() {
    if (!form.name.trim()) {
        alert('이름을 입력하세요.');
        return false;
    }

    if (!form.birth) {
        alert('생년월일을 입력하세요.');
        return false;
    }

    if (!form.phone.trim()) {
        alert('전화번호를 입력하세요.');
        return false;
    }

    if (!form.gender) {
        alert('성별을 선택하세요.');
        return false;
    }

    if (!form.roadAddress.trim()) {
        alert('주소 검색을 해주세요.');
        return false;
    }

    return true;
}

// 신규 등록 저장
function saveCreate() {
    if (!validateForm()) return;

    emit('created', {
        name: form.name,
        birth: form.birth,
        phone: form.phone,
        gender: form.gender,
        address: makeFinalAddress(),
        disability_type: form.disability_type,
        relation: form.relation
    });
}

// 수정 저장
function saveUpdate() {
    if (!validateForm()) return;

    emit('updated', {
        id: form.id,
        name: form.name,
        birth: form.birth,
        phone: form.phone,
        gender: form.gender,
        address: makeFinalAddress(),
        disability_type: form.disability_type,
        relation: form.relation
    });

    mode.value = 'view';
}
</script>
<template>
    <div class="bg-surface-0 dark:bg-surface-900">
        <!-- 제목 -->
        <div class="mb-5">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <span class="text-muted-color">
                        {{ mode === 'view' ? '선택한 지원대상자 정보를 확인할 수 있습니다.' : mode === 'create' ? '새로운 지원대상자 정보를 입력해주세요.' : '지원대상자 정보를 수정할 수 있습니다.' }}
                    </span>
                </div>

                <Button v-if="mode === 'view' && target" label="수정" severity="secondary" @click="editMode" />
            </div>
        </div>

        <!-- 선택된 대상자가 없을 때 -->
        <div v-if="!props.target && !props.isCreateMode" class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-5 text-muted-color">왼쪽에서 대상자를 선택하세요.</div>

        <!-- 보기 모드 -->
        <div v-else-if="mode === 'view'" class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
            <div class="grid gap-3">
                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">이름</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.name || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">생년월일</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.birth || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">전화번호</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.phone || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">성별</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ getGenderLabel(form.gender) || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">주소</div>
                    <div class="text-surface-900 dark:text-surface-0 break-all">{{ form.address || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">장애유형</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.disability_type || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">관계</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.relation || '-' }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 py-2">
                    <div class="font-semibold text-surface-700 dark:text-surface-200">등록일</div>
                    <div class="text-surface-900 dark:text-surface-0">{{ form.created_at || '-' }}</div>
                </div>
            </div>
        </div>

        <!-- 수정 / 등록 모드 -->
        <div v-else class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 lg:p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 이름 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">이름</label>
                    <InputText v-model="form.name" class="w-full" placeholder="이름 입력" />
                </div>

                <!-- 생년월일 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">생년월일</label>
                    <InputText v-model="form.birth" type="date" class="w-full" />
                </div>

                <!-- 전화번호 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">전화번호</label>
                    <InputText v-model="form.phone" class="w-full" placeholder="010-0000-0000" />
                </div>

                <!-- 성별 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">성별</label>
                    <select v-model="form.gender" class="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0">
                        <option value="">선택하세요</option>
                        <option value="c1">남자</option>
                        <option value="c2">여자</option>
                    </select>
                </div>

                <!-- 주소 -->
                <div class="md:col-span-2">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">주소</label>

                    <div class="flex flex-col sm:flex-row gap-2 mb-2">
                        <InputText v-model="form.zonecode" placeholder="우편번호" readonly class="w-full sm:w-40" />
                        <Button type="button" label="우편번호 검색" @click="searchAddress" />
                    </div>

                    <InputText v-model="form.roadAddress" placeholder="기본주소" readonly class="w-full mb-2" />

                    <InputText id="detailAddress" v-model="form.detailAddress" placeholder="상세주소" class="w-full" />
                </div>

                <!-- 장애유형 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">장애유형</label>
                    <InputText v-model="form.disability_type" class="w-full" placeholder="장애유형 입력" />
                </div>

                <!-- 관계 -->
                <div>
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">관계</label>
                    <InputText v-model="form.relation" class="w-full" placeholder="관계 입력" />
                </div>

                <!-- 등록일 -->
                <div v-if="mode !== 'create'" class="md:col-span-2">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">등록일</label>
                    <InputText :value="form.created_at" readonly class="w-full" />
                </div>
            </div>

            <!-- 버튼 -->
            <div class="flex gap-2 justify-end pt-5 mt-5 border-t border-surface-200 dark:border-surface-700">
                <Button v-if="mode === 'create'" label="등록" @click="saveCreate" />

                <template v-else>
                    <Button label="취소" severity="secondary" outlined @click="cancelEdit" />
                    <Button label="저장" @click="saveUpdate" />
                </template>
            </div>
        </div>
    </div>
</template>
