// 마이페이지 지원대상자 조회
const selectTargets = `
SELECT
    beneficiaries_no AS id,
    beneficiaries_name AS name,
    birth,
    tel AS phone,
    gender,
    beneficiaries_address AS address,
    disability_type,
    relation,
    created_at
FROM beneficiaries
WHERE guardian_no = ?
ORDER BY beneficiaries_no DESC
`;
// 마이페이지 지원대상자 수정
const updateTarget = `
UPDATE beneficiaries
SET
    beneficiaries_name = ?,
    birth = ?,
    tel = ?,
    gender = ?,
    beneficiaries_address = ?,
    disability_type = ?,
    relation = ?
WHERE beneficiaries_no = ?
  AND guardian_no = ?
`;
// 마이페이지 지원대상자 등록
const insertTarget = `
INSERT INTO beneficiaries (
    guardian_no,
    manager_no,
    sub_manager_no,
    institution_no,
    beneficiaries_name,
    birth,
    tel,
    gender,
    beneficiaries_address,
    disability_type,
    relation,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;

const updateMypage = `
UPDATE user
SET
    user_name = ?,
    tel = ?,
    address = ?
WHERE user_no = ?
`;

const mypageInfoSql = ` 
SELECT u.user_id
      ,u.user_name
      ,u.tel
      ,u.email
      ,u.address
      ,i.name AS ins
      ,DATE_FORMAT(u.created_at, '%Y-%m-%d') AS created_at
FROM user u JOIN institution i ON u.institution_no = i.institution_no
WHERE user_no = ?;
`;


// 보호자 기관번호 조회
const selectGuardianInstitutionNo = `
SELECT institution_no
FROM user
WHERE user_no = ?
`;
module.exports = {
  selectTargets,
  updateTarget,
  insertTarget,
  mypageInfoSql,
  selectGuardianInstitutionNo,
  updateMypage,
};
