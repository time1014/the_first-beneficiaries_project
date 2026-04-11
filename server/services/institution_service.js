const institutionMapper = require("../database/mappers/institution_mapper.js");

// 기관정보 조회
const findAll = async (institutionNo) => {
  let info = await institutionMapper.selectAllInstitution(institutionNo);
  return info || {};
};

// 기관 목록 전체조회(셀렉박스용)
const findInstitutionList = async () => {
  let list = await institutionMapper.selectInstitutionList();
  return list || [];
};

// 기관정보 수정
const modifyInfo = async (institutioninfo) => {
  let result = await institutionMapper.updateInstitution(institutioninfo);
  let resObj = {
    status: result?.affectedRows > 0,
    target: {
      ...institutioninfo,
    },
  };
  return resObj;
};

module.exports = { findAll, findInstitutionList, modifyInfo };
