const { pool } = require("../DAO");
const infoSql = require("../sql/info");

const managerInfo = async (insNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(infoSql.mInfo, [insNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const adminInfo = async (insNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(infoSql.aInfo, [insNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const managerUpdate = async (mNo, uName, uTel, uEmail, uIns) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(infoSql.mUpdate, [
      uName,
      uTel,
      uEmail,
      uIns,
      mNo,
    ]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const adminUpdate = async (mNo, uName, uTel, uEmail, uIns) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(infoSql.aUpdate, [
      uName,
      uTel,
      uEmail,
      uIns,
      mNo,
    ]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insInfo = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(infoSql.iInfo);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const managerInsert = async (uId, uPass, uName, uTel, uEmail, uIns) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(infoSql.mInsert, [
      uId,
      uPass,
      uName,
      uTel,
      uEmail,
      uIns,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const adminInsert = async (uId, uPass, uName, uTel, uEmail, uIns) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(infoSql.aInsert, [
      uId,
      uPass,
      uName,
      uTel,
      uEmail,
      uIns,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  managerInfo,
  adminInfo,
  managerUpdate,
  adminUpdate,
  insInfo,
  managerInsert,
  adminInsert,
};
