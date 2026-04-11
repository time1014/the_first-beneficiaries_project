const listMapper = require("../database/mappers/list_mapper");

const listInfoService = async (userNo) => {
  console.log(userNo);

  let list = await listMapper.list(userNo);
  return list;
};

const beneficiariesService = async (userNo) => {
  console.log(userNo);

  let list = await listMapper.beneficiaries(userNo);
  return list;
};
module.exports = { listInfoService, beneficiariesService };
