const infoMapper = require("../database/mappers/info_mapper");

const managerInfoService = async (insNo) => {
  let list = await infoMapper.managerInfo(insNo);
  return list;
};

const adminInfoService = async (insNo) => {
  let list = await infoMapper.adminInfo(insNo);
  return list;
};

const managerUpdateService = async (mNo, uName, uTel, uEmail, uIns) => {
  let list = await infoMapper.managerUpdate(mNo, uName, uTel, uEmail, uIns);
  return list;
};

const adminUpdateService = async (mNo, uName, uTel, uEmail, uIns) => {
  let list = await infoMapper.adminUpdate(mNo, uName, uTel, uEmail, uIns);
  return list;
};

const insInfoService = async () => {
  let list = await infoMapper.insInfo();
  return list;
};

const managerInsertService = async (uId, uPass, uName, uTel, uEmail, uIns) => {
  let list = await infoMapper.managerInsert(
    uId,
    uPass,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  return list;
};

const adminInsertService = async (uId, uPass, uName, uTel, uEmail, uIns) => {
  let list = await infoMapper.adminInsert(
    uId,
    uPass,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  return list;
};

module.exports = {
  managerInfoService,
  adminInfoService,
  managerUpdateService,
  adminUpdateService,
  insInfoService,
  managerInsertService,
  adminInsertService,
};
