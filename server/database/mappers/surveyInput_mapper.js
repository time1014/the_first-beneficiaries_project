const { pool } = require("../DAO");
const surveyInputSql = require("../sql/surveyInput");

// 보호자에대한 지원대상자 SLECET
const list = async (userNo) => {
  console.log(userNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveyInputSql.beneficiariesList, [userNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// -> 지원대상자에대한 정보 불러오기 SELECT
const beneficiaries = async (userNo) => {
  console.log(userNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveyInputSql.beneficiariesInfo, [userNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const surveyQuestion = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveyInputSql.surveyQuestion);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// -> 새조사지생성 INSERT

const createSurvey = async (mainInfo) => {
  // userInfo는 배열, {user_id, user_pwd, user_name, user_gender, user_age, join_data}
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(surveyInputSql.createSurvey, mainInfo);
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

// -> 조사지 답변 저장 INSERT
const createSurveyInput = async (values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const result = await conn.batch(surveyInputSql.createSurveyInput, values);
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  }
};

const survey_QA = async (surveyNo) => {
  console.log(surveyNo);

  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(surveyInputSql.survey_QA, [surveyNo]);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  list,
  beneficiaries,
  createSurvey,
  createSurveyInput,
  surveyQuestion,
  survey_QA,
};
