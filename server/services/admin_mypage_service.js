const dao = require("../database/DAO");
const sql = require("../database/sql/admin_mypage");
const mapper = require("../database/mappers/admin_mypage_mapper");

// 기관관리자 본인정보 조회
const getAdminMyPage = async (userNo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectAdminMyPage, [userNo]);
    return mapper.adminMyPage(rows);
  } catch (err) {
    console.error("service - getAdminMyPage 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 기관관리자 본인정보 수정
const updateAdminMyPage = async (adminInfo) => {
  let conn = null;

  try {
    conn = await dao.pool.getConnection();

    const params = [adminInfo.user_name, adminInfo.tel, adminInfo.user_no];

    const result = await conn.query(sql.updateAdminMyPage, params);
    return result;
  } catch (err) {
    console.error("service - updateAdminMyPage 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getAdminMyPage,
  updateAdminMyPage,
};
