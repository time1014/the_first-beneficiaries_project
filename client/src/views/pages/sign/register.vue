<script setup>
import SurveyHistoryModal from '@/components/dialog/Institution_dialog.vue';

import router from '@/router';

const selectedRole = ref('');
import { reactive, ref, computed, watch, onUnmounted } from 'vue';
const clickRole = async (role_name) => {
    selectedRole.value = role_name;
    info.role = role_name;
};
const isEmailVerified = ref(false);
const isVerified = ref(false);
const isUserMatched = ref(false);

const isGeneralUser = computed(() => info.role === 'e1');
const getMissingFields = () => {
    const missing = [];

    if (!info.role) missing.push('회원유형');
    if (!info.user_name?.trim()) missing.push('이름');
    if (!info.user_id?.trim()) missing.push('아이디');
    if (!info.user_pw?.trim()) missing.push('비밀번호');
    if (!info.user_pwd?.trim()) missing.push('비밀번호 확인');
    if (!info.user_email?.trim()) missing.push('이메일');
    if (!info.user_account?.trim()) missing.push('인증번호');
    if (!info.tel?.trim()) missing.push('연락처');
    if (!info.institution?.trim()) missing.push('기관');

    if (isGeneralUser.value) {
        const isAddressEmpty = !form.zonecode || !form.roadAddress || !form.detailAddress;

        if (isAddressEmpty) {
            missing.push('주소');
        }
    }

    return missing;
};
const form = reactive({
    zonecode: '',
    roadAddress: '',
    detailAddress: ''
});

const formdata = computed(() => {
    return form.zonecode + ' ' + form.roadAddress + ' ' + form.detailAddress;
});
// const user_account = ref('');
const info = reactive({
    user_account: '',
    role: '',
    user_name: '',
    user_id: '',
    user_pwd: '',
    user_email: '',
    tel: '',
    institution: '',
    institution_no: null
});

const sendCode = async (email) => {
    console.log(email);
    await fetch('/api/mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email
        })
    })
        .then((resp) => resp.json())
        .then((data) => {
            console.log(data);
            startTimer();
            alert('메일 발송 성공');
        })
        .catch((err) => console.log(err));
};

const verifyCode = async (code) => {
    if (!code) {
        alert('인증번호를 입력해주세요.');
        return;
    }

    if (isExpired.value) {
        alert('인증시간이 만료되었습니다. 다시 인증번호를 받아주세요.');
        return;
    }

    let emailData = {
        user_email: info.user_email,
        code: code
    };
    const res = await fetch('/api/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    const data = await res.json();
    console.log(data);

    if (data.retCode === true) {
        isEmailVerified.value = true;
        clearInterval(interval);
        alert('인증 성공');
    } else {
        isEmailVerified.value = false;
        alert(data.message || '인증 실패');
    }
};

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
// 데이터 파싱, 전송

const addUserInfo = async () => {
    const missingFields = getMissingFields();

    if (missingFields.length > 0) {
        alert(`입력 안 된 칸이 있습니다.\n\n${missingFields.join(', ')}`);
        return;
    }

    if (info.user_pw !== info.user_pwd) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
    }
    if (!isEmailVerified.value) {
        alert('이메일 인증을 완료해주세요.');
        return;
    } else {
        let data = {
            role: info.role,
            user_name: info.user_name,
            user_id: info.user_id,
            user_pwd: info.user_pwd,
            user_email: info.user_email,
            tel: info.tel,
            address: formdata.value,
            institution: info.institution_no
        };

        console.log(data);

        let result = await fetch(`/api/users`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .catch((err) => console.log(err));
        console.log(result);
        console.log(result.insertId);

        if (result.insertId != null) {
            console.log('회원가입완료');

            router.push('/sign/login');
        } else {
            alert('중복된 아이디입니다.');
        }
    }
};

const goToLogin = () => {
    router.push('/sign/login');
};
const historyDialog = ref(false);
const openHistoryModal = () => {
    historyDialog.value = true;
};

// 타이머
const timer = ref(180);
let interval = null;
const isExpired = ref(false);

// 값이 바뀌면 기존 인증 상태 초기화
watch(
    () => info.user_email,
    () => {
        isEmailVerified.value = false;
        info.user_account = '';
        isExpired.value = false;
        clearInterval(interval);
    }
);

// 타이머 시작
const startTimer = () => {
    timer.value = 180;
    isExpired.value = false;

    clearInterval(interval);

    interval = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        }

        if (timer.value <= 0) {
            clearInterval(interval);
            isExpired.value = true;
            alert('인증시간이 만료되었습니다.');
        }
    }, 1000);
};

// 컴포넌트 벗어나면 타이머 정리
onUnmounted(() => {
    clearInterval(interval);
});

// 타이머 포맷
const formatTime = computed(() => {
    const min = String(Math.floor(timer.value / 60)).padStart(2, '0');
    const sec = String(timer.value % 60).padStart(2, '0');
    return `${min}:${sec}`;
});

const checked = ref(false);
</script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467ZM33.3284 11.4538C31.6493 10.2396 29.5855 9.52381 27.3546 9.52381C25.1195 9.52381 23.0524 10.2421 21.3717 11.4603C20.0078 11.3232 18.6475 11.1387 17.2933 10.907C19.7453 8.11308 23.3438 6.34921 27.3546 6.34921C31.36 6.34921 34.9543 8.10844 37.4061 10.896C36.0521 11.1292 34.692 11.3152 33.3284 11.4538ZM43.826 18.0518C43.881 18.6003 43.9091 19.1566 43.9091 19.7194C43.9091 28.8568 36.4973 36.2642 27.3546 36.2642C18.2117 36.2642 10.8 28.8568 10.8 19.7194C10.8 19.1615 10.8276 18.61 10.8816 18.0663L7.75383 17.4411C7.66775 18.1886 7.62354 18.9488 7.62354 19.7194C7.62354 30.6102 16.4574 39.4388 27.3546 39.4388C38.2517 39.4388 47.0855 30.6102 47.0855 19.7194C47.0855 18.9439 47.0407 18.1789 46.9536 17.4267L43.826 18.0518ZM44.2613 9.54743L40.9084 10.2176C37.9134 5.95821 32.9593 3.1746 27.3546 3.1746C21.7442 3.1746 16.7856 5.96385 13.7915 10.2305L10.4399 9.56057C13.892 3.83178 20.1756 0 27.3546 0C34.5281 0 40.8075 3.82591 44.2613 9.54743Z"
                            fill="var(--primary-color)"
                        />
                        <mask id="mask0_1413_1551" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="8" width="54" height="11">
                            <path d="M27 18.3652C10.5114 19.1944 0 8.88892 0 8.88892C0 8.88892 16.5176 14.5866 27 14.5866C37.4824 14.5866 54 8.88892 54 8.88892C54 8.88892 43.4886 17.5361 27 18.3652Z" fill="var(--primary-color)" />
                        </mask>
                        <g mask="url(#mask0_1413_1551)">
                            <path
                                d="M-4.673e-05 8.88887L3.73084 -1.91434L-8.00806 17.0473L-4.673e-05 8.88887ZM27 18.3652L26.4253 6.95109L27 18.3652ZM54 8.88887L61.2673 17.7127L50.2691 -1.91434L54 8.88887ZM-4.673e-05 8.88887C-8.00806 17.0473 -8.00469 17.0505 -8.00132 17.0538C-8.00018 17.055 -7.99675 17.0583 -7.9944 17.0607C-7.98963 17.0653 -7.98474 17.0701 -7.97966 17.075C-7.96949 17.0849 -7.95863 17.0955 -7.94707 17.1066C-7.92401 17.129 -7.89809 17.1539 -7.86944 17.1812C-7.8122 17.236 -7.74377 17.3005 -7.66436 17.3743C-7.50567 17.5218 -7.30269 17.7063 -7.05645 17.9221C-6.56467 18.3532 -5.89662 18.9125 -5.06089 19.5534C-3.39603 20.83 -1.02575 22.4605 1.98012 24.0457C7.97874 27.2091 16.7723 30.3226 27.5746 29.7793L26.4253 6.95109C20.7391 7.23699 16.0326 5.61231 12.6534 3.83024C10.9703 2.94267 9.68222 2.04866 8.86091 1.41888C8.45356 1.10653 8.17155 0.867278 8.0241 0.738027C7.95072 0.673671 7.91178 0.637576 7.90841 0.634492C7.90682 0.63298 7.91419 0.639805 7.93071 0.65557C7.93897 0.663455 7.94952 0.673589 7.96235 0.686039C7.96883 0.692262 7.97582 0.699075 7.98338 0.706471C7.98719 0.710167 7.99113 0.714014 7.99526 0.718014C7.99729 0.720008 8.00047 0.723119 8.00148 0.724116C8.00466 0.727265 8.00796 0.730446 -4.673e-05 8.88887ZM27.5746 29.7793C37.6904 29.2706 45.9416 26.3684 51.6602 23.6054C54.5296 22.2191 56.8064 20.8465 58.4186 19.7784C59.2265 19.2431 59.873 18.7805 60.3494 18.4257C60.5878 18.2482 60.7841 18.0971 60.9374 17.977C61.014 17.9169 61.0799 17.8645 61.1349 17.8203C61.1624 17.7981 61.1872 17.7781 61.2093 17.7602C61.2203 17.7512 61.2307 17.7427 61.2403 17.7348C61.2452 17.7308 61.2499 17.727 61.2544 17.7233C61.2566 17.7215 61.2598 17.7188 61.261 17.7179C61.2642 17.7153 61.2673 17.7127 54 8.88887C46.7326 0.0650536 46.7357 0.0625219 46.7387 0.0600241C46.7397 0.0592345 46.7427 0.0567658 46.7446 0.0551857C46.7485 0.0520238 46.7521 0.0489887 46.7557 0.0460799C46.7628 0.0402623 46.7694 0.0349487 46.7753 0.0301318C46.7871 0.0204986 46.7966 0.0128495 46.8037 0.00712562C46.818 -0.00431848 46.8228 -0.00808311 46.8184 -0.00463784C46.8096 0.00228345 46.764 0.0378652 46.6828 0.0983779C46.5199 0.219675 46.2165 0.439161 45.7812 0.727519C44.9072 1.30663 43.5257 2.14765 41.7061 3.02677C38.0469 4.79468 32.7981 6.63058 26.4253 6.95109L27.5746 29.7793ZM54 8.88887C50.2691 -1.91433 50.27 -1.91467 50.271 -1.91498C50.2712 -1.91506 50.272 -1.91535 50.2724 -1.9155C50.2733 -1.91581 50.274 -1.91602 50.2743 -1.91616C50.2752 -1.91643 50.275 -1.91636 50.2738 -1.91595C50.2714 -1.91515 50.2652 -1.91302 50.2552 -1.9096C50.2351 -1.90276 50.1999 -1.89078 50.1503 -1.874C50.0509 -1.84043 49.8938 -1.78773 49.6844 -1.71863C49.2652 -1.58031 48.6387 -1.377 47.8481 -1.13035C46.2609 -0.635237 44.0427 0.0249875 41.5325 0.6823C36.215 2.07471 30.6736 3.15796 27 3.15796V26.0151C33.8087 26.0151 41.7672 24.2495 47.3292 22.7931C50.2586 22.026 52.825 21.2618 54.6625 20.6886C55.5842 20.4011 56.33 20.1593 56.8551 19.986C57.1178 19.8993 57.3258 19.8296 57.4735 19.7797C57.5474 19.7548 57.6062 19.7348 57.6493 19.72C57.6709 19.7127 57.6885 19.7066 57.7021 19.7019C57.7089 19.6996 57.7147 19.6976 57.7195 19.696C57.7219 19.6952 57.7241 19.6944 57.726 19.6938C57.7269 19.6934 57.7281 19.693 57.7286 19.6929C57.7298 19.6924 57.7309 19.692 54 8.88887ZM27 3.15796C23.3263 3.15796 17.7849 2.07471 12.4674 0.6823C9.95717 0.0249875 7.73904 -0.635237 6.15184 -1.13035C5.36118 -1.377 4.73467 -1.58031 4.3155 -1.71863C4.10609 -1.78773 3.94899 -1.84043 3.84961 -1.874C3.79994 -1.89078 3.76474 -1.90276 3.74471 -1.9096C3.73469 -1.91302 3.72848 -1.91515 3.72613 -1.91595C3.72496 -1.91636 3.72476 -1.91643 3.72554 -1.91616C3.72593 -1.91602 3.72657 -1.91581 3.72745 -1.9155C3.72789 -1.91535 3.72874 -1.91506 3.72896 -1.91498C3.72987 -1.91467 3.73084 -1.91433 -4.673e-05 8.88887C-3.73093 19.692 -3.72983 19.6924 -3.72868 19.6929C-3.72821 19.693 -3.72698 19.6934 -3.72603 19.6938C-3.72415 19.6944 -3.72201 19.6952 -3.71961 19.696C-3.71482 19.6976 -3.70901 19.6996 -3.7022 19.7019C-3.68858 19.7066 -3.67095 19.7127 -3.6494 19.72C-3.60629 19.7348 -3.54745 19.7548 -3.47359 19.7797C-3.32589 19.8296 -3.11788 19.8993 -2.85516 19.986C-2.33008 20.1593 -1.58425 20.4011 -0.662589 20.6886C1.17485 21.2618 3.74125 22.026 6.67073 22.7931C12.2327 24.2495 20.1913 26.0151 27 26.0151V3.15796Z"
                                fill="var(--primary-color)"
                            />
                        </g>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">회원가입</div>
                    </div>

                    <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                        <Button label="일반사용자" :class="['w-full md:w-[8.5rem]', info.role === 'e1' ? '!bg-gray-300 !border-gray-300 !text-white' : '']" v-on:click="clickRole('e1')"></Button>
                        <Button label="기관담당자" :class="['w-full md:w-[8.5rem]', info.role === 'e2' ? '!bg-gray-300 !border-gray-300 !text-white' : '']" v-on:click="clickRole('e2')"></Button>
                        <Button label="기관관리자" :class="['w-full md:w-[8.5rem]', info.role === 'e3' ? '!bg-gray-300 !border-gray-300 !text-white' : '']" v-on:click="clickRole('e3')"></Button>
                    </div>
                    <div>
                        <label for="user_name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">이름</label>
                        <InputText id="user_name" type="text" placeholder="성함을 입력해주세요" class="w-full md:w-[30rem] mb-8" v-model="info.user_name" />

                        <label for="user_id" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">아이디</label>
                        <InputText id="user_id" type="text" placeholder="아이디를 입력해주세요" class="w-full md:w-[30rem] mb-8" v-model="info.user_id" />

                        <label for="user_pw" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">비밀번호</label>
                        <Password id="user_pw" v-model="info.user_pw" placeholder="비밀번호를 입력해주세요" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <label for="user_pwd" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">비밀번호 확인</label>
                        <Password id="user_pwd" v-model="info.user_pwd" placeholder="비밀번호를 입력해주세요" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <label for="user_email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">이메일</label>
                        <InputGroup class="mb-4">
                            <InputText id="user_email" type="text" placeholder="이메일을 입력해주세요" v-model="info.user_email" :disabled="isEmailVerified" />
                            <Button label="인증번호전송" class="font-bold auth-btn unified-btn" @click="sendCode(info.user_email)" :disabled="isEmailVerified" />
                        </InputGroup>

                        <label for="user_account" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">인증번호</label>
                        <InputGroup class="mb-2">
                            <InputText id="user_account" type="text" placeholder="인증번호를 입력해주세요" v-model="info.user_account" class="pr-20" :disabled="isEmailVerified" />
                            <InputGroupAddon class="timer-addon" v-if="!isEmailVerified">
                                <span class="timer-text">{{ formatTime }}</span>
                            </InputGroupAddon>

                            <Button label="확인" class="font-bold auth-btn unified-btn" @click="verifyCode(info.user_account)" :disabled="isEmailVerified" />
                        </InputGroup>

                        <span class="text-red-500 text-sm block mb-8" v-if="!isEmailVerified"> * 이메일 인증을 진행해주세요. </span>
                        <span class="text-blue-500 text-sm block mb-8" v-else> * 인증이 완료되었습니다. </span>

                        <label for="tel" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">연락처</label>
                        <InputText id="tel" type="text" placeholder="전화번호를 입력해주세요" class="w-full md:w-[30rem] mb-8" v-model="info.tel" />
                        <template v-if="isGeneralUser">
                            <label for="address" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">주소</label>
                            <div class="flex flex-col sm:flex-row gap-2 mb-2">
                                <InputText placeholder="우편번호" readonly class="w-40" v-model="form.zonecode" />
                                <Button type="button" label="우편번호 검색" @click="searchAddress" />
                            </div>
                            <InputText placeholder="기본주소" readonly class="w-full md:w-[30rem] mb-8" v-model="form.roadAddress" />
                            <br />
                            <InputText id="detailAddress" type="text" placeholder="상세주소를 입력해주세요" class="w-full md:w-[30rem] mb-8" v-model="form.detailAddress" />
                        </template>
                        <label for="institution" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">기관</label>
                        <InputText id="institution" placeholder="기관을 선택해주세요" class="w-full md:w-[30rem] mb-8" v-model="info.institution" @click="openHistoryModal" readonly />
                        <SurveyHistoryModal
                            v-model:visible="historyDialog"
                            @selectInstitution="
                                (item) => {
                                    info.institution = item.institution_name;
                                    info.institution_no = item.institution_no;
                                }
                            "
                        />
                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <Button type="submit" label="회원가입" class="w-full" v-on:click="addUserInfo()"></Button>
                            <Button type="submit" label="로그인" class="w-full" v-on:click="goToLogin()"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.auth-btn {
    width: 110px !important;
    flex-shrink: 0;
}

.timer-text {
    color: #034487 !important;
    font-variant-numeric: tabular-nums;
}

.timer-addon {
    background: transparent !important;
    border-left: none !important;
    border-right: none !important;
    color: #22c55e;
    font-weight: 600;
}

.p-inputgroup .p-inputtext {
    border-right: none !important;
}

.p-inputgroup .p-button {
    border-left: none !important;
}
</style>
