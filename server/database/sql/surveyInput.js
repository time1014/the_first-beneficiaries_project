const { pool } = require("../DAO");

// 신청할 사용자 선택 -> 조사지 답변 -> 확인

// 보호자에대한 지원대상자 SLECET
const beneficiariesList = `
SELECT b.beneficiaries_name as beneficiaries_name
		,b.beneficiaries_no as beneficiaries_no
FROM beneficiaries b
LEFT JOIN user g 
    ON b.guardian_no = g.user_no
WHERE b.guardian_no = ?;
`;

// -> 지원대상자에대한 정보 불러오기 SELECT
const beneficiariesInfo = `
SELECT 
    b.beneficiaries_name,
    b.disability_type,
    DATE_FORMAT(b.birth, '%Y-%m-%d') AS birth,
    b.gender,
    c.code_name AS gender_name,

    CASE
        WHEN EXISTS (
            SELECT 1
            FROM survey_input si
            WHERE si.beneficiaries_no = b.beneficiaries_no
        ) THEN 'Y'
        ELSE 'N'
    END AS has_survey,

    CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM survey_input si
            WHERE si.beneficiaries_no = b.beneficiaries_no
        ) THEN NULL

        WHEN EXISTS (
            SELECT 1
            FROM survey_input si
            LEFT JOIN support_plan sp
                   ON sp.survey_no = si.survey_no
            LEFT JOIN support_plan_result spr
                   ON spr.support_plan_no = sp.support_plan_no
            WHERE si.beneficiaries_no = b.beneficiaries_no
              AND (spr.finish IS NULL OR spr.finish <> 1)
        ) THEN 'N'

        ELSE 'Y'
    END AS is_finish

FROM beneficiaries b
LEFT JOIN common_code c
       ON c.group_id = 'gender'
      AND c.common_id = b.gender
WHERE b.beneficiaries_no = ?;
`;

const surveyQuestion = `
SELECT 
    m.main_no AS main_no,
    m.main_title AS main_title,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'sub_no', s.sub_no,
            'sub_title', s.sub_title,
            'questions', q.questions
        )
    ) AS subs
FROM survey_main m
JOIN survey_sub s ON s.main_no = m.main_no
LEFT JOIN (
    SELECT sub_no, JSON_ARRAYAGG(JSON_OBJECT(
        'question_no', question_no,
        'question_text', question_text,
        'answer', NULL
    )) AS questions
    FROM survey_question
    GROUP BY sub_no
) q ON q.sub_no = s.sub_no
GROUP BY m.main_no, m.main_title;
`;

// -> 새조사지생성 INSERT

const createSurvey = `
INSERT INTO survey_input(version_no,beneficiaries_no)
VALUES (1,?);
`;

// -> 조사지 답변 저장 INSERT

const createSurveyInput = `
INSERT INTO survey_answer(survey_no,question_no,choice_value )
 VALUES (?, ?, ?);
`;

const survey_QA = `
SELECT 
    m.main_no AS main_no,
    m.main_title AS main_title,
    DATE_FORMAT(si.created_at, '%Y-%m-%d') as created_at,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'sub_no', s.sub_no,
            'sub_title', s.sub_title,
            'questions', COALESCE(q.questions, JSON_ARRAY())
        )
    ) AS subs
FROM survey_input si
JOIN survey_main m
LEFT JOIN survey_sub s
       ON s.main_no = m.main_no
LEFT JOIN (
    SELECT 
        q.sub_no,
        a.survey_no,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'question_no', q.question_no,
                'question_text', q.question_text,
                'answer_name', c.code_name
            )
        ) AS questions
    FROM survey_question q
    LEFT JOIN survey_answer a
           ON a.question_no = q.question_no
    LEFT JOIN common_code c
           ON c.group_id = 'surveyValue'
          AND c.common_id = a.choice_value
    GROUP BY q.sub_no, a.survey_no
) q
       ON q.sub_no = s.sub_no
      AND q.survey_no = si.survey_no
WHERE si.survey_no = ?
GROUP BY m.main_no, m.main_title, si.created_at;
`;

module.exports = {
  beneficiariesList,
  beneficiariesInfo,
  createSurvey,
  createSurveyInput,
  surveyQuestion,
  survey_QA,
};
