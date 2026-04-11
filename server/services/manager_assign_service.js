const dao = require("../database/DAO");
const sql = require("../database/sql/manager_assign");
const mapper = require("../database/mappers/manager_assign_mapper");

// 승인된 기관담당자 목록 조회
const getApprovedManagerList = async (institutionNo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectApprovedManagerList, [
      institutionNo,
    ]);

    return mapper.approvedManagerList(rows);
  } catch (err) {
    console.error("service - getApprovedManagerList 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 조사지 담당자 / 부담당자 지정 저장
const updateSurveyManagerAssign = async (managerNo, subManagerNo, surveyNo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();
    const result = await conn.query(sql.updateSurveyManagerAssign, [
      managerNo,
      subManagerNo,
      surveyNo,
    ]);

    return result;
  } catch (err) {
    console.error("service - updateSurveyManagerAssign 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getApprovedManagerList,
  updateSurveyManagerAssign,
};
