const counselMapper = require("../database/mappers/counsel_mapper");


const counselInfoService = async (surNo) => {
  let list = await counselMapper.counsel(surNo);
  return list;
};

const counselInsertService = async (surNo , beneNo, userNo,title, content , date,  file) => {
  let list = await counselMapper.counselInsert(surNo , beneNo, userNo,title, content , date,  file);
  return list;
};

const counselUpdateService = async (
  no, title, content,date, name, role, files, deleteFiles
) => {
  return await counselMapper.counselUpdate(
    no, title, content,date ,name, role, files, deleteFiles
  );
};

const counselHistoryService = async (cNo) => {
  let list = await counselMapper.counselHistory(cNo);
  return list;
};



const counselDeleteService = async (no) => {
  let list = await counselMapper.counselDelete(no);
  return list;
};


const storageService = async (date, title, content, surNo, wNo,beneNo) => {
  let list = await counselMapper.counselSave(date, title, content, surNo, wNo,beneNo);
  return list;
}

const counselStorageInfoService = async (surNo, wNo) => {
  let list = await counselMapper.counselSaveList(surNo, wNo)
  return list;
}

const counselSaveDeleteService = async (sNo) => {
  let list = await counselMapper.counselSaveDelete(sNo);
  return list;
}


const counselBeneInfoService = async (beneNo) => {
  let list = await counselMapper.counselBeneInfo(beneNo);
  return list;
}

module.exports = {counselInfoService ,counselInsertService,counselUpdateService,counselHistoryService,counselDeleteService,storageService,counselStorageInfoService,counselSaveDeleteService,counselBeneInfoService}