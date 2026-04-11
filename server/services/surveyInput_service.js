const surveyInputMapper = require("../database/mappers/surveyInput_mapper");

// 보호자에대한 지원대상자 SLECET
const beneficiariesList = async (userNo) => {
  console.log(userNo);

  let list = await surveyInputMapper.list(userNo);
  return list;
};

// -> 지원대상자에대한 정보 불러오기 SELECT
const beneficiariesInfo = async (userNo) => {
  console.log(userNo);

  let list = await surveyInputMapper.beneficiaries(userNo);
  return list;
};

const surveyQuestionService = async () => {
  let list = await surveyInputMapper.surveyQuestion();
  return list;
};

// -> 새조사지생성 INSERT
const createSurveyService = async (surveyNo) => {
  const { beneficiaries_no } = surveyNo;
  let insertData = beneficiaries_no;
  console.log(surveyNo);
  let result = await surveyInputMapper.createSurvey(insertData);
  console.log(result);

  return result;
};

// -> 조사지 답변 저장 INSERT
const createSurveyInputService = async (answers) => {
  const values = answers.map((a) => [
    a.survey_no,
    a.question_no,
    a.choice_value,
  ]);
  console.log(values);
  let result = await surveyInputMapper.createSurveyInput(values);
};

const survey_QAService = async (surveyNo) => {
  console.log(surveyNo);

  let list = await surveyInputMapper.survey_QA(surveyNo);
  return list;
};

module.exports = {
  beneficiariesList,
  beneficiariesInfo,
  createSurveyService,
  createSurveyInputService,
  surveyQuestionService,
  survey_QAService,
};
