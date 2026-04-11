<script setup>
// computed: 현재 선택된 대상자 계산
// ref: 반응형 변수
// onMounted: 화면 처음 들어올 때 실행
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
const router = useRouter();

// 왼쪽 목록 / 오른쪽 상세 컴포넌트
import TargetList from './TargetList.vue';
import TargetDetail from './TargetDetail.vue';
import MyPageInfo from './MyPageInfo.vue';

// API 함수
import { getTargets, createTarget as createTargetApi, updateTarget as updateTargetApi } from '@/service/MyPageService';

// 지원대상자 목록
const targets = ref([]);

// 현재 선택된 대상자 id
const selectedId = ref(null);

// 신규 등록 모드 여부
const isCreateMode = ref(false);

//정보 보기 모드 여부
const isMyInfoMode = ref(false);

// 로그인 사용자 정보
const loginUser = JSON.parse(localStorage.getItem('user'));
const loginUserNo = loginUser?.user_no || null;
const loginUserName = loginUser?.user_name || '사용자';
const userStore = useUserStore();
// 지원대상자 목록 불러오기
async function loadTargets() {
    try {
        // 로그인 정보가 없으면 중단
        if (!loginUserNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await getTargets(loginUserNo);

        if (result.retCode === 'OK') {
            targets.value = result.data || [];

            // 등록 모드가 아닐 때만 첫 대상 자동 선택
            if (!isCreateMode.value) {
                if (targets.value.length > 0) {
                    selectedId.value = targets.value[0].id;
                } else {
                    selectedId.value = null;
                }
            }
        } else {
            alert(result.message || '지원대상자 목록 조회 실패');
        }
    } catch (err) {
        console.error('loadTargets 오류:', err);
        alert('지원대상자 목록을 불러오지 못했습니다.');
    }
}

// 왼쪽 목록에서 대상 선택
function selectTarget(id) {
    isCreateMode.value = false;
    isMyInfoMode.value = false;
    selectedId.value = id;
}

// 신규 등록 버튼 클릭
function addTarget() {
    isCreateMode.value = true;
    isMyInfoMode.value = false;
    selectedId.value = null;
}

// 신규 등록 처리
async function createTarget(newTarget) {
    try {
        if (!loginUserNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await createTargetApi(newTarget, loginUserNo);

        if (result.retCode === 'OK') {
            alert('등록되었습니다.');
            isCreateMode.value = false;

            // 등록 후 목록 다시 조회
            await loadTargets();

            // insertId가 있으면 해당 대상 선택
            if (result.insertId) {
                selectedId.value = result.insertId;
            } else if (targets.value.length > 0) {
                // 없으면 마지막 항목 선택
                selectedId.value = targets.value[targets.value.length - 1].id;
            }
        } else {
            alert(result.message || '등록 실패');
        }
    } catch (err) {
        console.error('createTarget 오류:', err);
        alert('등록 중 오류가 발생했습니다.');
    }
}

// 수정 처리
async function updateTarget(updated) {
    try {
        if (!loginUserNo) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const result = await updateTargetApi(updated, loginUserNo);

        if (result.retCode === 'OK') {
            alert('수정되었습니다.');
            userStore.updateUser({
                user_name: updated.user_name,
                role: updated.role
            });

            // 수정 후 목록 다시 조회
            await loadTargets();

            // 수정한 대상 다시 선택
            selectedId.value = updated.id;
        } else {
            alert(result.message || '수정 실패');
        }
    } catch (err) {
        console.error('updateTarget 오류:', err);
        alert('수정 중 오류가 발생했습니다.');
    }
}

// 현재 오른쪽 상세영역에 보여줄 대상자 객체
const selectedTarget = computed(() => {
    if (isCreateMode.value) return null;
    return targets.value.find((item) => item.id === selectedId.value) || null;
});

const goToMyInfo = () => {
    isMyInfoMode.value = true;
    isCreateMode.value = false;
};

// 화면 처음 열릴 때 목록 조회
onMounted(() => {
    loadTargets();
});

// 회원탈퇴 페이지 이동_은지
function goToWithdraw() {
    router.push('/sign/with-draw');
}
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8 h-full">
        <div class="md:w-2/8 h-full">
            <div class="card h-full flex flex-col p-0 overflow-hidden">
                <div class="flex justify-between items-center p-5 bg-white border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-user text-blue-500 text-sm"></i>
                        <div class="text-sm font-semibold text-gray-800">
                            보호자 : <span class="text-blue-600">{{ loginUserName }}</span>
                        </div>
                    </div>
                    <button type="button" class="text-[11px] px-2.5 py-1 border border-gray-200 rounded bg-white text-gray-500 hover:bg-gray-50 transition-all font-medium" @click="goToMyInfo">보호자 정보</button>
                </div>

                <div class="flex-1 min-h-0 p-5 pt-6">
                    <TargetList :targets="targets" :selectedId="selectedId" @select="selectTarget" @add="addTarget" />
                </div>

                <div class="px-5 pb-5">
                    <Button label="회원탈퇴" class="w-full" severity="danger" @click="goToWithdraw" />
                </div>
            </div>
        </div>

        <!-- 오른쪽 상세 -->

        <div class="md:w-6/8 h-full">
            <div class="card h-full flex flex-col gap-4">
                <div class="flex-1 min-h-0">
                    <MyPageInfo v-if="isMyInfoMode" />

                    <TargetDetail v-else :target="selectedTarget" :isCreateMode="isCreateMode" @created="createTarget" @updated="updateTarget" />
                </div>
            </div>
        </div>
    </div>
</template>
