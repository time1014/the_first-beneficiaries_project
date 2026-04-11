const { pool } = require("../DAO");

const mInfo = `
SELECT user_no
      ,user_id
      ,u.user_name as name
      ,u.tel
      ,u.email
      ,u.address
      ,u.institution_no  as ins_no
      ,i.name as ins
      ,DATE_FORMAT(u.created_at, '%Y-%m-%d') as created_at
FROM user u JOIN institution i ON u.institution_no  = i.institution_no
WHERE u.institution_no = ? AND u.role = 'e2'
`;

const aInfo = `
SELECT user_no
      ,user_id
      ,u.user_name as name
      ,u.tel
      ,u.email
      ,u.address
      ,u.institution_no  as ins_no
      ,i.name as ins
      ,DATE_FORMAT(u.created_at, '%Y-%m-%d') as created_at
FROM user u JOIN institution i ON u.institution_no  = i.institution_no
WHERE u.institution_no = ? AND u.role = 'e3'
`;

const iInfo = `
SELECT institution_no AS ins_no
      , name AS ins_name
FROM institution
WHERE operation = 1
`;

const mUpdate = `
UPDATE user
SET user_name = ?  , tel = ? , email = ? , institution_no = ?
WHERE user_no = ?
`;

const aUpdate = `
UPDATE user
SET user_name = ?  , tel = ? , email = ? , institution_no = ?
WHERE user_no = ?
`;

const mInsert = `
INSERT INTO user(user_id , user_pw,user_name , tel,email,institution_no,approval,role)
values(?,?,?,?,?,?,1,'e2')

`;

const aInsert = `
INSERT INTO user(user_id , user_pw,user_name , tel,email,institution_no,approval,role)
values(?,?,?,?,?,?,1,'e3')

`;

module.exports = { mInfo, aInfo, mUpdate, aUpdate, iInfo, mInsert, aInsert };
