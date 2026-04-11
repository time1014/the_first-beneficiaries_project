// server/services/institution_mypage_service.js

const dao = require("../database/DAO");
const sql = require("../database/sql/institution_mypage");

// 기관담당자 본인정보 조회
async function getInstitutionMyPage(userNo) {
  // DAO.js에서 pool만 export 했으므로 pool.query 사용
  const result = await dao.pool.query(sql.selectInstitutionMyPage, [userNo]);

  if (!result || result.length === 0) {
    return {
      retCode: "FAIL",
      message: "사용자 정보를 찾을 수 없습니다.",
    };
  }

  return {
    retCode: "OK",
    data: result[0],
  };
}

// 기관담당자 본인정보 수정
async function updateInstitutionMyPage(userNo, payload) {
  const { user_name, tel } = payload;

  await dao.pool.query(sql.updateInstitutionMyPage, [user_name, tel, userNo]);

  return {
    retCode: "OK",
    message: "수정되었습니다.",
  };
}

module.exports = {
  getInstitutionMyPage,
  updateInstitutionMyPage,
};
