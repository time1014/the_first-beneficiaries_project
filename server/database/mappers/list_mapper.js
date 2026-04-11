const { pool } = require("../DAO");
const listSql = require("../sql/list");

const list = async (userNo) => {
  console.log(userNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(listSql.list, [userNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const beneficiaries = async (userNo) => {
  console.log(userNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(listSql.beneficiaries, [userNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { list, beneficiaries };
