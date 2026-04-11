const { pool } = require("../DAO");
const userSql = require("../sql/users");

const insertUser = async (userInfo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.insertUser, userInfo);
    console.log(result.insertId);
    await conn.query(userSql.signApproval, [userInfo[2]]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const loginUser = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [result] = await conn.query(userSql.loginUser, [userId]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const approval = async (insNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.approval, [insNo]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const approvalByAdmin = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.approvalByAdmin);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const access = async (userId) => {
  let conn = null;
  const user = userId.userId;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.access, [user]);
    await conn.query(userSql.signAccess, [user]);
    conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const signX = async (userId) => {
  let conn = null;
  const user = userId.userId;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.signRefuse, [user]);
    await conn.query(userSql.signRefuse2, [user]);
    conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const insTel = async (no) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [result] = await conn.query(userSql.instelSelect, [no]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 아이디 찾기
const findUserIdByEmail = async (email) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let rows = await conn.query(userSql.findUserIdByEmail, [email]);
    return rows[0] || null;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

// 비밀번호 찾기
const findUserByIdAndEmail = async (userId, email) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let rows = await conn.query(userSql.findUserByIdAndEmail, [userId, email]);
    return rows[0] || null;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

// 비밀번호 변경
const updatePw = async (userId, userPw) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Auto Commit 해제

    let result = await conn.query(userSql.updatePw, [userPw, userId]);

    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

// user_id로 이메일 조회
const selectUserById = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(userSql.selectUserById, [userId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 2. user_id 기준 탈퇴
const withdrawUser = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(userSql.withdrawUser, [userId]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  insertUser,
  loginUser,
  approval,
  approvalByAdmin,
  access,
  signX,
  insTel,
  findUserIdByEmail,
  findUserByIdAndEmail,
  updatePw,
  selectUserById,
  withdrawUser,
};
