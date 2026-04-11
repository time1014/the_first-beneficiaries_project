// 관리자 마이페이지
// 조회
const selectAdminMyPage = `
SELECT u.user_no
     , u.user_id
     , u.user_name
     , u.tel
     , u.email
     , u.address
     , u.created_at
     , i.name AS institution_name
FROM user u
LEFT JOIN institution i
  ON u.institution_no = i.institution_no
WHERE u.user_no = ?
  AND u.role = 'e3'
`;
// 수정
const updateAdminMyPage = `
UPDATE user
   SET user_name = ?
     , tel = ?
 WHERE user_no = ?
   AND role = 'e3'
`;

module.exports = {
  selectAdminMyPage,
  updateAdminMyPage,
};
