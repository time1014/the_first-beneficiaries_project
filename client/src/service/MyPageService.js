const BASE_URL = '/api/mypage';

// 로그인 사용자 기준 지원대상자 조회
async function getTargets(userNo) {
    const resp = await fetch(`${BASE_URL}/targets/${userNo}`);

    if (!resp.ok) {
        throw new Error('지원대상자 조회 실패');
    }

    return await resp.json();
}

// 지원대상자 등록
async function createTarget(target, userNo) {
    const resp = await fetch(`${BASE_URL}/targets/${userNo}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(target)
    });

    if (!resp.ok) {
        throw new Error('지원대상자 등록 실패');
    }

    return await resp.json();
}

// 지원대상자 수정
async function updateTarget(target, userNo) {
    const resp = await fetch(`${BASE_URL}/targets/${target.id}/${userNo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(target)
    });

    if (!resp.ok) {
        throw new Error('지원대상자 수정 실패');
    }

    return await resp.json();
}

const myInfo = async (no) => {
    try {
        const result = await fetch(`${BASE_URL}/myPageInfo/${no}`);
        const data = await result.json();
        return data;
    } catch (err) {
        console.error('내 정보 조회 실패:', err);
    }
};

export { getTargets, createTarget, updateTarget, myInfo };
