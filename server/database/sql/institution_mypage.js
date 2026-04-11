// 마이페이지 기관담당자 정보 조회
const selectInstitutionMyPage = `
SELECT
    u.user_no,
    u.user_id,
    u.user_name,
    u.tel,
    u.email,
    u.address,
    u.created_at,
    i.name AS institution_name
FROM \`user\` u
LEFT JOIN institution i
    ON u.institution_no = i.institution_no
WHERE u.user_no = ?
`;
// 마이페이지 기관담당자 정보 수정
const updateInstitutionMyPage = `
UPDATE \`user\`
SET
    user_name = ?,
    tel = ?
WHERE user_no = ?
`;

module.exports = {
  selectInstitutionMyPage,
  updateInstitutionMyPage,
};
