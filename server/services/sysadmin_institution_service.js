const dao = require("../database/DAO");
const sql = require("../database/sql/sysadmin_institution");

/* =========================
   기관 전체조회
========================= */
const getInstitutionList = async (keyword = "") => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const trimmedKeyword = keyword.trim();

    let rows;
    if (trimmedKeyword) {
      const likeKeyword = `%${trimmedKeyword}%`;
      rows = await conn.query(sql.selectInstitutionListByKeyword, [
        likeKeyword,
        likeKeyword,
      ]);
    } else {
      rows = await conn.query(sql.selectInstitutionList);
    }

    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관 상세조회
========================= */
const getInstitutionByNo = async (institutionNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectInstitutionByNo, [institutionNo]);
    return rows[0] || null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관 등록
========================= */
const addInstitution = async ({
  name,
  business_number,
  tel,
  institution_address,
  institution_email,
  operation,
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const result = await conn.query(sql.insertInstitution, [
      name,
      business_number,
      tel,
      institution_address,
      institution_email,
      operation,
    ]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관 수정
========================= */
const editInstitution = async (
  institutionNo,
  {
    name,
    business_number,
    tel,
    institution_address,
    institution_email,
    operation,
  },
) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const result = await conn.query(sql.updateInstitution, [
      name,
      business_number,
      tel,
      institution_address,
      institution_email,
      operation,
      institutionNo,
    ]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
/* =========================
   기관 선택삭제
========================= */
const deleteInstitutionList = async (institutionNos = []) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    if (!institutionNos.length) {
      throw new Error("삭제할 기관이 없습니다.");
    }

    const checkRows = await conn.query(
      sql.selectInstitutionOperationForDelete,
      institutionNos,
    );

    const hasOperatingInstitution = checkRows.some(
      (row) => Number(row.operation) === 1,
    );

    if (hasOperatingInstitution) {
      throw new Error("운영중인 기관은 삭제할 수 없습니다.");
    }

    const result = await conn.query(sql.deleteInstitutionList, institutionNos);

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
module.exports = {
  getInstitutionList,
  getInstitutionByNo,
  addInstitution,
  editInstitution,
  deleteInstitutionList,
};
