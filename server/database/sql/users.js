const { pool } = require("../DAO");

const insertUser = `
INSERT INTO user (role, user_name, user_id, user_pw, email, tel, address, institution_no)
VALUES(?,?, ?, ?, ?, ?, ?,?)
`;

const signApproval = `
INSERT INTO sign_approval (user_id)
VALUES(?)

`;

const loginUser = `
SELECT user_no,
       role,
       user_id,
       user_name,
       user_pw,
       approval,
       institution_no
FROM user
WHERE user_id = ?
`;

const approval = `
SELECT 
        sa.approval_no as no,
        u.user_name as name,
        u.user_id as id,
        i.name as ins,
        u.tel,
        u.email,
        DATE_FORMAT(u.created_at, '%Y-%m-%d') as created_at
FROM user u
JOIN sign_approval sa ON u.user_id = sa.user_id
JOIN institution i ON u.institution_no = i.institution_no
WHERE sa.approval = 0 AND u.institution_no = ?
ORDER BY sa.approval_no DESC
`;

const approvalByAdmin = `
SELECT 
    sa.approval_no AS no,       
    u.user_name AS name,
    u.user_id AS id,
    i.name AS ins,            
    u.tel,
    u.email,
    DATE_FORMAT(u.created_at, '%Y-%m-%d') AS created_at
FROM user u
JOIN sign_approval sa ON u.user_id = sa.user_id 
LEFT JOIN institution i ON u.institution_no = i.institution_no
WHERE u.approval = '0'       
  AND u.role = 'e3'
ORDER BY sa.approval_no DESC;
`;

const access = `
UPDATE user
SET approval = 1
WHERE user_id = ?
`;

const signAccess = `
UPDATE sign_approval
SET approval = 1
WHERE user_id = ?
`;

const signRefuse = `
DELETE FROM sign_approval
WHERE user_id = ?
`;

const signRefuse2 = `
DELETE FROM user
WHERE user_id = ?
`;

const instelSelect = `
SELECT tel
FROM institution
WHERE institution_no = ?
`;

// 아이디 찾기
const findUserIdByEmail = `
SELECT user_id, email
FROM user
WHERE email = ?
`;

// 비밀번호 찾기
const findUserByIdAndEmail = `
SELECT user_id,email
FROM user
WHERE user_id = ?
AND   email = ?
`;

// 비밀번호 변경
const updatePw = `
UPDATE user
SET user_pw = ?
WHERE user_id = ?
`;

// user_id로 이메일 조회
const selectUserById = `
SELECT user_id, email
FROM user
WHERE user_id = ?
`;

// user_id 기준 탈퇴
const withdrawUser = `
DELETE FROM user
WHERE user_id = ?
`;

module.exports = {
  loginUser,
  approval,
  approvalByAdmin,
  insertUser,
  signApproval,
  access,
  signAccess,
  signRefuse,
  signRefuse2,
  instelSelect,
  findUserIdByEmail,
  findUserByIdAndEmail,
  updatePw,
  selectUserById,
  withdrawUser,
};
