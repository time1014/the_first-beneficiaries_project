// client/src/service/InstitutionMyPageService.js

// 기관담당자 본인정보 조회 함수
// userNo를 받아서 백엔드에 GET 요청을 보냄
async function getInstitutionMyPage(userNo) {
    // 백엔드 조회 API 호출
    // 예: http://localhost:3000/institutionmypage/3007
    const res = await fetch(`/api/institutionmypage/${userNo}`);

    // 응답을 먼저 text 형태로 받음
    // 왜 text로 받냐면, 에러가 났을 때 응답 원본을 확인하기 쉬움
    const text = await res.text();

    // text를 다시 JSON 객체로 변환해서 반환
    return JSON.parse(text);
}

// 기관담당자 본인정보 수정 함수
// userNo: 수정할 사용자 번호
// payload: 수정할 데이터 객체
// 예: { user_name: '홍길동', tel: '010-1111-2222', address: '대구광역시 ...' }
async function updateInstitutionMyPage(userNo, payload) {
    // 백엔드 수정 API 호출
    const res = await fetch(`/api/institutionmypage/${userNo}`, {
        // PUT 방식으로 수정 요청
        method: 'PUT',

        // 요청 본문이 JSON 형식이라는 뜻
        headers: {
            'Content-Type': 'application/json'
        },

        // 자바스크립트 객체(payload)를 JSON 문자열로 바꿔서 전송
        body: JSON.stringify(payload)
    });

    // 수정 결과도 응답으로 오므로 text로 먼저 받음
    const text = await res.text();

    // text를 JSON으로 바꿔서 반환
    // 이걸 해줘야 호출한 쪽에서 result.retCode 같은 걸 사용할 수 있음
    return JSON.parse(text);
}

// 다른 파일에서 import 해서 쓸 수 있도록 export
export { getInstitutionMyPage, updateInstitutionMyPage };
