const priorityMapper = require("../database/mappers/priority_mapper");

// -> 지원대상자에대한 정보 불러오기 SELECT
const priorityInfoService = async (surveyNo) => {
  console.log(surveyNo);

  let list = await priorityMapper.priorityInfo(surveyNo);
  return list;
};

const createPriorityService = async (priorityObj) => {
  const { priority_id, survey_no, writer_no } = priorityObj;

  let insertData = [priority_id, survey_no, writer_no];
  let result = await priorityMapper.insertPriority(insertData);

  return result;
};

const updatePriorityService = async (surveyNo, priorityObj) => {
  const { approval, approver, reason_rejection } = priorityObj;

  let insertData = {
    approval,
    approver,
    reason_rejection,
  };
  let result = await priorityMapper.updatePriority(surveyNo, insertData);
  return result;
};

module.exports = {
  priorityInfoService,
  createPriorityService,
  updatePriorityService,
};
