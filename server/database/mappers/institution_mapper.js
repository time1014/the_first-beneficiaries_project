const { pool } = require("../DAO");
const institutionSql = require("../sql/institutions.js");

// 기관정보 조회
const selectAllInstitution = async (institutionNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let [rows] = await conn.execute(institutionSql.selectAllInstitution, [
      institutionNo,
    ]);

    return rows || {};
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 기관 목록 전체조회(셀렉박스용)
const selectInstitutionList = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const rows = await conn.execute(institutionSql.selectInstitutionList);

    return rows || [];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 기관정보 수정
const updateInstitution = async (institution) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Auto Commit 해제

    const { institution_no, ...updateData } = institution;

    const result = await conn.query(institutionSql.updateInstitution, [
      updateData,
      institution_no,
    ]);

    await conn.commit();

    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectAllInstitution,
  selectInstitutionList,
  updateInstitution,
};
