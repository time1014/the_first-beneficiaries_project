const { pool } = require("../DAO");
const surveySql = require("../sql/survey");

const main = async (mainNo) => {
  console.log(mainNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveySql.main, [mainNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const sub = async (subNo) => {
  console.log(subNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveySql.sub, [subNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const question = async (questionNo) => {
  console.log(questionNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveySql.question, [questionNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 등록
const insertMain = async (mainInfo) => {
  // userInfo는 배열, {user_id, user_pwd, user_name, user_gender, user_age, join_data}
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveySql.insertMain, mainInfo);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertSub = async (subInfo) => {
  // userInfo는 배열, {user_id, user_pwd, user_name, user_gender, user_age, join_data}
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [result] = await conn.query(surveySql.insertSub, subInfo);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertQuestion = async (questionInfo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [result] = await conn.query(surveySql.insertQuestion, questionInfo);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 수정
const updateMain = async (mainNo, updateDta) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); //Auto Commit 해제
    let result = await conn.query(surveySql.updateSub, [
      updateDta.main_title,
      mainNo,
    ]);
    // 추가 DML 실헹 => 같은 트렉잭션으로 묶임
    conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const updateSub = async (subNo, updateDta) => {
  let conn = null;
  console.log(subNo, updateDta.sub_title);
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); //Auto Commit 해제
    let result = await conn.query(surveySql.updateSub, [
      updateDta.sub_title,
      subNo,
    ]);
    // 추가 DML 실헹 => 같은 트렉잭션으로 묶임
    conn.commit();
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const updateQuestion = async (questionNo, updateDta) => {
  let conn = null;
  console.log(questionNo);
  console.log(updateDta.question_text);
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); //Auto Commit 해제
    let result = await conn.query(surveySql.updateQuestion, [
      updateDta.question_text,
      questionNo,
    ]);
    // 추가 DML 실헹 => 같은 트렉잭션으로 묶임
    conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

// 삭제
const deleteMain = async (no) => {
  let conn = null;
  try {
    // connectionPool에서 대기중인 connection 반환
    conn = await pool.getConnection();
    let [result] = await conn.query(surveySql.deleteMain, no);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    // 사용이 끝난 connection를 pool에 돌려줌
    if (conn) conn.release();
  }
};

const deleteSub = async (no) => {
  let conn = null;
  try {
    // connectionPool에서 대기중인 connection 반환
    conn = await pool.getConnection();
    let [result] = await conn.query(surveySql.deleteSub, no);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    // 사용이 끝난 connection를 pool에 돌려줌
    if (conn) conn.release();
  }
};

const deleteQuestion = async (no) => {
  let conn = null;
  try {
    // connectionPool에서 대기중인 connection 반환
    conn = await pool.getConnection();
    let [result] = await conn.query(surveySql.deleteQuestion, no);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    // 사용이 끝난 connection를 pool에 돌려줌
    if (conn) conn.release();
  }
};

const saveAll = async (data) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const {
      mainCreated = [],
      mainUpdated = [],
      mainDeleted = [],
      subCreated = [],
      subUpdated = [],
      subDeleted = [],
      questionCreated = [],
      questionUpdated = [],
      questionDeleted = [],
    } = data;

    const mainIdMap = new Map();
    const subIdMap = new Map();

    console.log("payload:", data);

    // 1. 삭제는 자식부터
    for (const questionNo of questionDeleted) {
      await conn.query(surveySql.deleteQuestion, [questionNo]);
    }

    for (const subNo of subDeleted) {
      await conn.query(surveySql.deleteSub, [subNo]);
    }

    for (const mainNo of mainDeleted) {
      await conn.query(surveySql.deleteMain, [mainNo]);
    }

    // 2. 메인 추가
    for (const item of mainCreated) {
      const result = await conn.query(surveySql.insertMain, [item.main_title]);
      const insertId = result.insertId || result[0]?.insertId;

      if (!insertId) {
        throw new Error(`main insertId 없음: ${item.main_title}`);
      }

      if (item.temp_id) {
        mainIdMap.set(item.temp_id, insertId);
      }
    }

    console.log("mainIdMap:", [...mainIdMap.entries()]);

    // 3. 메인 수정
    for (const item of mainUpdated) {
      await conn.query(surveySql.updateMain, [item.main_title, item.main_no]);
    }

    // 4. 서브 추가
    for (const item of subCreated) {
      let resolvedMainNo = item.main_no;

      if (!resolvedMainNo && item.parent_temp_id) {
        resolvedMainNo = mainIdMap.get(item.parent_temp_id);
      }

      console.log("sub mapping:", {
        sub_title: item.sub_title,
        item_main_no: item.main_no,
        parent_temp_id: item.parent_temp_id,
        resolvedMainNo,
      });

      if (!resolvedMainNo) {
        throw new Error(`sub main_no 매핑 실패: ${item.sub_title}`);
      }

      const result = await conn.query(surveySql.insertSub, [
        resolvedMainNo,
        item.sub_title,
      ]);

      const insertId = result.insertId || result[0]?.insertId;

      if (!insertId) {
        throw new Error(`sub insertId 없음: ${item.sub_title}`);
      }

      if (item.temp_id) {
        subIdMap.set(item.temp_id, insertId);
      }
    }

    console.log("subIdMap:", [...subIdMap.entries()]);

    // 5. 서브 수정
    for (const item of subUpdated) {
      await conn.query(surveySql.updateSub, [item.sub_title, item.sub_no]);
    }

    // 6. 질문 추가
    for (const item of questionCreated) {
      let resolvedSubNo = item.sub_no;

      if (!resolvedSubNo && item.parent_temp_id) {
        resolvedSubNo = subIdMap.get(item.parent_temp_id);
      }

      console.log("question mapping:", {
        question_text: item.question_text,
        item_sub_no: item.sub_no,
        parent_temp_id: item.parent_temp_id,
        resolvedSubNo,
      });

      if (!resolvedSubNo) {
        throw new Error(`question sub_no 매핑 실패: ${item.question_text}`);
      }

      await conn.query(surveySql.insertQuestion, [
        resolvedSubNo,
        item.question_text,
      ]);
    }

    // 7. 질문 수정
    for (const item of questionUpdated) {
      await conn.query(surveySql.updateQuestion, [
        item.question_text,
        item.question_no,
      ]);
    }

    await conn.commit();
    return { success: true, message: "저장 완료" };
  } catch (err) {
    if (conn) await conn.rollback();
    console.log(err);
    return { success: false, message: "저장 실패", error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  main,
  sub,
  question,
  insertMain,
  insertSub,
  insertQuestion,
  updateMain,
  updateSub,
  updateQuestion,
  deleteMain,
  deleteSub,
  deleteQuestion,
  saveAll,
};
