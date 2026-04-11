const { pool } = require("../DAO");

// 조회
const main = `
SELECT main_title, main_no
FROM survey_main;
`;

const sub = `
SELECT sub_title, sub_no
FROM survey_sub
WHERE main_no = ?;
`;

const question = `
SELECT question_no, question_text, sub_no
FROM survey_question
WHERE sub_no = ?;
`;

// 등록
const insertMain = `
INSERT INTO survey_main(version_no, main_title)
VALUES (1,?);
`;

const insertSub = `
INSERT INTO survey_sub(main_no, sub_title)
VALUES (?,?);
`;

const insertQuestion = `
INSERT INTO survey_question(sub_no, question_text)
VALUES (?,?);
`;

// 수정
const updateMain = `
UPDATE survey_main
SET main_title = ?
WHERE main_no = ?
`;

const updateSub = `
UPDATE survey_sub
SET sub_title = ?
WHERE sub_no = ?
`;

const updateQuestion = `
UPDATE survey_question
SET question_text = ?
WHERE question_no = ?
`;

// 삭제
const deleteMain = `
DELETE
FROM survey_main
WHERE main_no =?
`;

const deleteSub = `
DELETE
FROM survey_sub
WHERE sub_no =?
`;

const deleteQuestion = `
DELETE
FROM survey_question
WHERE question_no =?
`;

module.exports = {
  main,
  sub,
  question,
  insertMain,
  insertSub,
  insertQuestion,
  updateMain,
  updateSub,
  updateQuestion,
  deleteMain,
  deleteSub,
  deleteQuestion,
};
