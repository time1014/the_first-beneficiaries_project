const { pool } = require("../DAO");

// 기관정보 조회
const selectAllInstitution = `
SELECT name,
       tel,
       institution_address,
       institution_email,
       business_number,
       operation
FROM institution
WHERE institution_no = ?
`;

// 기관 목록 전체조회(셀렉박스용)
const selectInstitutionList = `
SELECT institution_no,
       name AS institution_name
FROM institution
ORDER BY name ASC
`;

// 기관정보 수정
const updateInstitution = `
UPDATE institution
SET ?
WHERE institution_no = ?`;

module.exports = {
  selectAllInstitution,
  selectInstitutionList,
  updateInstitution,
};
