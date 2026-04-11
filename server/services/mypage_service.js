// DB 연결 객체 가져오기
const dao = require("../database/DAO");

// 마이페이지에서 사용할 SQL문 가져오기
const sql = require("../database/sql/mypage");

// ==============================
// 로그인 사용자 기준 지원대상자 목록 조회
// ==============================
const findAllTargets = async (userNo) => {
  // DB 커넥션을 담을 변수
  let conn = null;

  try {
    // 커넥션 풀에서 DB 연결 1개 가져오기
    conn = await dao.pool.getConnection();

    // SQL 실행
    // sql.selectTargets 안에는
    // WHERE guardian_no = ? 조건이 들어있음
    // [userNo] 값이 ? 자리에 들어감
    const rows = await conn.query(sql.selectTargets, [userNo]);

    // 조회 결과 반환
    return rows;
  } catch (err) {
    // 에러가 나면 서버 콘솔에 출력
    console.error("service - findAllTargets 에러:", err);

    // router 쪽에서도 잡을 수 있게 다시 던짐
    throw err;
  } finally {
    // DB 연결을 다 썼으면 반드시 반환
    // 안 하면 커넥션이 계속 쌓여서 문제 생김
    if (conn) conn.release();
  }
};

// ==============================
// 로그인 사용자 기준 지원대상자 수정
// ==============================
const modifyTarget = async (target) => {
  let conn = null;

  try {
    // DB 연결 가져오기
    conn = await dao.pool.getConnection();

    // SQL의 ? 자리에 들어갈 값 순서대로 작성
    // updateTarget SQL 순서와 완전히 같아야 함
    const params = [
      target.name, // beneficiaries_name
      target.birth, // birth
      target.phone, // tel
      target.gender, // gender
      target.address, // beneficiaries_address
      target.disability_type, // disability_type
      target.relation, // relation
      target.id, // beneficiaries_no
      target.userNo, // guardian_no
    ];

    // UPDATE SQL 실행
    const result = await conn.query(sql.updateTarget, params);

    // 실행 결과 반환
    return result;
  } catch (err) {
    console.error("service - modifyTarget 에러:", err);
    throw err;
  } finally {
    // DB 연결 반환
    if (conn) conn.release();
  }
};

// ==============================
// 지원대상자 등록
// ==============================
const createTarget = async (target) => {
  let conn = null;

  try {
    // DB 연결 가져오기
    conn = await dao.pool.getConnection();

    // INSERT SQL의 ? 순서에 맞게 값 넣기
    const params = [
      target.userNo, // guardian_no (로그인 사용자 번호)
      target.managerNo, // manager_no
      target.subManagerNo, // sub_manager_no
      target.institutionNo, // institution_no
      target.name, // beneficiaries_name
      target.birth, // birth
      target.phone, // tel
      target.gender, // gender
      target.address, // beneficiaries_address
      target.disability_type, // disability_type
      target.relation, // relation
    ];

    // INSERT 실행
    const result = await conn.query(sql.insertTarget, params);

    // insert 결과 반환
    // 보통 insertId가 들어있음
    return result;
  } catch (err) {
    console.error("service - createTarget 에러:", err);
    throw err;
  } finally {
    // DB 연결 반환
    if (conn) conn.release();
  }
};

const myPageInfoService = async (uNo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();
    const [rows] = await conn.query(sql.mypageInfoSql, [uNo]);

    return rows;
  } catch (err) {
    console.error("service - myPageInfoService 에러:", err);

    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const myPageTarget = async (target) => {
  let conn = null;

  try {
    // DB 연결 가져오기
    conn = await dao.pool.getConnection();

    // SQL의 ? 자리에 들어갈 값 순서대로 작성
    // updateTarget SQL 순서와 완전히 같아야 함
    const params = [
      target.name, // beneficiaries_name
      target.tel, // tel
      target.address, // beneficiaries_address
      target.user_no, // guardian_no
    ];

    // UPDATE SQL 실행
    const result = await conn.query(sql.updateMypage, params);

    // 실행 결과 반환
    return result;
  } catch (err) {
    console.error("service - mypageTarget 에러:", err);
    throw err;
  } finally {
    // DB 연결 반환
    if (conn) conn.release();
  }
};
// ==============================
// 보호자 기관번호 조회
// ==============================
const findGuardianInstitutionNo = async (userNo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();

    const rows = await conn.query(sql.selectGuardianInstitutionNo, [userNo]);

    // 조회 결과가 없으면 null 반환
    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0].institution_no;
  } catch (err) {
    console.error("service - findGuardianInstitutionNo 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
  findAllTargets,
  modifyTarget,
  createTarget,
  myPageInfoService,
  findGuardianInstitutionNo,
  myPageTarget,
};
