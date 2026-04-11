const { pool } = require("../DAO");
const prioritySql = require("../sql/priority");

const priorityInfo = async (surveyNo) => {
  console.log(surveyNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(prioritySql.InfoPriority, [surveyNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertPriority = async (priorityInfo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(prioritySql.createPriority, priorityInfo);
    console.log(result);

    await conn.commit();

    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const updatePriority = async (surveyNo, updateDta) => {
  console.log(updateDta);
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); //Auto Commit 해제
    let result = await conn.query(prioritySql.updatePriority, [
      updateDta,
      surveyNo,
    ]);
    // 추가 DML 실헹 => 같은 트렉잭션으로 묶임
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  priorityInfo,
  insertPriority,
  updatePriority,
};
