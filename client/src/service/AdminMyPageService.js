async function getAdminMyPage(userNo) {
    const res = await fetch(`/api/admin/mypage/${userNo}`);
    const text = await res.text();

    if (!text) {
        throw new Error('조회 응답이 비어 있습니다.');
    }

    return JSON.parse(text);
}

async function updateAdminMyPage(userNo, adminInfo) {
    const res = await fetch(`/api/admin/mypage/${userNo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminInfo)
    });

    const text = await res.text();

    if (!text) {
        throw new Error('수정 응답이 비어 있습니다.');
    }

    return JSON.parse(text);
}

export { getAdminMyPage, updateAdminMyPage };
