const surveyMapper = require("../database/mappers/survey_mapper");

// 전체조회
const mainInfoService = async (mainNo) => {
  console.log(mainNo);

  let list = await surveyMapper.main(mainNo);
  return list;
};

const subInfoService = async (subNo) => {
  console.log(subNo);

  let list = await surveyMapper.sub(subNo);
  return list;
};

const questionInfoService = async (questionNo) => {
  console.log(questionNo);

  let list = await surveyMapper.question(questionNo);
  return list;
};

// 등록
const createMainService = async (mainObj) => {
  const { main_title } = mainObj;
  let insertData = main_title;
  console.log(mainObj);
  let result = await surveyMapper.insertMain(insertData);
  // let resObj = {
  //   // 성공 여부
  //   status: result.insertId > 0 ? "success" : "fail",
  //   // primary key(user_no) 반환
  //   user_no: result.insertId,
  // };
  // return resObj;
};

const createSubService = async (subObj) => {
  const { main_no, sub_title } = subObj;
  let insertData = [main_no, sub_title];
  let result = await surveyMapper.insertSub(insertData);
  // let resObj = {
  //   // 성공 여부
  //   status: result.insertId > 0 ? "success" : "fail",
  //   // primary key(user_no) 반환
  //   user_no: result.insertId,
  // };
  // return resObj;
};

const createQuestionService = async (questionObj) => {
  const { sub_no, question_text } = questionObj;
  let insertData = [sub_no, question_text];
  let result = await surveyMapper.insertQuestion(insertData);
  let resObj = {
    // 성공 여부
    status: result.insertId > 0 ? "success" : "fail",
    // primary key(user_no) 반환
    user_no: result.insertId,
  };
  return resObj;
};

// 수정
const updateMainService = async (no, mainObj) => {
  let result = await surveyMapper.updateMain(no, mainObj);
  let resObj = {
    // 성공여부
    status: result.changedRows > 0,
    // 성공여부
    target: mainObj,
  };
  return resObj;
};

const updateSubService = async (no, subObj) => {
  let result = await surveyMapper.updateSub(no, subObj);
  let resObj = {
    // 성공여부
    status: result.changedRows > 0,
    // 성공여부
    target: subObj,
  };
  return resObj;
};

const updateQuestionService = async (no, questionObj) => {
  console.log(questionObj);
  let result = await surveyMapper.updateQuestion(no, questionObj);
  let resObj = {
    // 성공여부
    status: result.changedRows > 0,
    // 성공여부
    target: questionObj,
  };
  return resObj;
};

// 삭제
const deleteMainService = async (mainNo) => {
  let info = await surveyMapper.deleteMain(mainNo);
  return info;
};

const deleteSubService = async (subNo) => {
  let info = await surveyMapper.deleteSub(subNo);
  return info;
};
const deleteQuestionService = async (questionNo) => {
  let info = await surveyMapper.deleteQuestion(questionNo);
  return info;
};

const saveAllService = async (target) => {
  let result = await surveyMapper.saveAll(target);
  return result;
};

module.exports = {
  mainInfoService,
  subInfoService,
  questionInfoService,
  createMainService,
  createSubService,
  createQuestionService,
  updateMainService,
  updateSubService,
  updateQuestionService,
  deleteMainService,
  deleteSubService,
  deleteQuestionService,
  saveAllService,
};
