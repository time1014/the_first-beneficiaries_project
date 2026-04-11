const { pool } = require("../DAO");

const list = `
SELECT MAX(b.beneficiaries_name) AS beneficiaries_name
     , MAX(b.beneficiaries_no) AS beneficiaries_no
     , MAX(u.user_no) AS manager_no
     , MAX(h.user_no) AS sub_manager_no
     , MAX(g.user_name) AS guardian_name
     , MAX(g.institution_no) AS institution_no
     , MAX(DATE_FORMAT(s.created_at, '%Y-%m-%d')) AS created_at
     , MAX(CASE WHEN p.approval = 'a1' THEN p.priority_id END) AS priority_id
     , MAX(CASE WHEN p.approval = 'a1' THEN p.approval END) AS approval
     , MAX(CASE WHEN p.approval = 'a1' THEN c.code_name END) AS priority_name
     , MAX(u.user_name) AS manager_name
     , s.survey_no AS survey_no

     /* e2, e3용 */
     , COALESCE(MAX(plan_wait.cnt), 0) + COALESCE(MAX(result_wait.cnt), 0) AS review_cnt
     , COALESCE(MAX(plan_approve.cnt), 0) + COALESCE(MAX(result_approve.cnt), 0) AS approve_cnt
     , COALESCE(MAX(plan_reject.cnt), 0) + COALESCE(MAX(result_reject.cnt), 0) AS reject_cnt
     , COALESCE(MAX(result_only.cnt), 0) AS result_cnt
     , COALESCE(MAX(result_finish.cnt), 0) AS finish_cnt

     /* e1용 진행중 */
     , MAX(
         CASE
           WHEN COALESCE(result_finish.cnt, 0) > 0 THEN 0
           ELSE GREATEST(
                  COALESCE(plan_approve.cnt, 0) - COALESCE(result_approve_all.cnt, 0),
                  0
                )
         END
       ) AS progress_cnt

     /* e1용 결과 */
     , MAX(
         CASE
           WHEN COALESCE(result_finish.cnt, 0) > 0 THEN 0
           ELSE COALESCE(result_approve_all.cnt, 0)
         END
       ) AS e1_result_cnt

FROM survey_input s
LEFT JOIN user u
       ON s.manager_no = u.user_no
JOIN beneficiaries b
     ON b.beneficiaries_no = s.beneficiaries_no
LEFT JOIN user g
       ON b.guardian_no = g.user_no
LEFT JOIN user h
       ON s.sub_manager_no = h.user_no
LEFT JOIN priority p
       ON s.survey_no = p.survey_no
LEFT JOIN common_code c
       ON c.group_id = 'priority'
      AND c.common_id = p.priority_id

/* 진행계획 대기 */
LEFT JOIN (
    SELECT survey_no, COUNT(*) AS cnt
    FROM support_plan
    WHERE plan_approval = 'a0'
    GROUP BY survey_no
) plan_wait
ON plan_wait.survey_no = s.survey_no

/* 진행계획 승인 */
LEFT JOIN (
    SELECT survey_no, COUNT(*) AS cnt
    FROM support_plan
    WHERE plan_approval = 'a1'
    GROUP BY survey_no
) plan_approve
ON plan_approve.survey_no = s.survey_no

/* 진행계획 반려 */
LEFT JOIN (
    SELECT survey_no, COUNT(*) AS cnt
    FROM support_plan
    WHERE plan_approval = 'a2'
    GROUP BY survey_no
) plan_reject
ON plan_reject.survey_no = s.survey_no

/* 결과 대기 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a0'
    GROUP BY sp.survey_no
) result_wait
ON result_wait.survey_no = s.survey_no

/* 결과 승인 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a1'
      AND spr.finish = 0
    GROUP BY sp.survey_no
) result_approve
ON result_approve.survey_no = s.survey_no

/* 결과 반려 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a2'
    GROUP BY sp.survey_no
) result_reject
ON result_reject.survey_no = s.survey_no

/* e2,e3용 결과 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a1'
      AND spr.finish = 0
    GROUP BY sp.survey_no
) result_only
ON result_only.survey_no = s.survey_no

/* e1 계산용 승인 결과 전체 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a1'
    GROUP BY sp.survey_no
) result_approve_all
ON result_approve_all.survey_no = s.survey_no

/* 종결 */
LEFT JOIN (
    SELECT sp.survey_no, COUNT(*) AS cnt
    FROM support_plan_result spr
    JOIN support_plan sp
      ON sp.support_plan_no = spr.support_plan_no
    WHERE spr.result_approval = 'a1'
      AND spr.finish = 1
    GROUP BY sp.survey_no
) result_finish
ON result_finish.survey_no = s.survey_no

JOIN user me
  ON me.user_no = ?

WHERE (
       me.role = 'e3'
    OR (me.role = 'e1' AND b.guardian_no = me.user_no)
    OR (me.role = 'e2' AND me.user_no IN (s.manager_no, s.sub_manager_no))
)

GROUP BY s.survey_no
ORDER BY s.created_at DESC;
`;

const beneficiaries = `
SELECT b.beneficiaries_name as beneficiaries_name
        ,g.user_name as guardian_name
        ,p.priority_id as priority_id
        , cc.code_name AS priority_name
        ,p.approval as approval
        ,b.gender as gender
        ,c.code_name as gender_name
        ,DATE_FORMAT(b.birth, '%Y-%m-%d')  as birth
        ,b.disability_type as disability_type
        ,b.beneficiaries_no as beneficiaries_no
        ,s.manager_no as manager_no
        ,s.sub_manager_no as sub_manager_no
        ,u.user_name as manager_name
        ,h.user_name as sub_manager_name
        ,s.survey_no as survey_no
        ,b.institution_no as institution_no
FROM survey_input s
LEFT JOIN user u ON s.manager_no = u.user_no
LEFT JOIN user h ON s.sub_manager_no = h.user_no
JOIN beneficiaries b ON b.beneficiaries_no = s.beneficiaries_no
LEFT JOIN user g
    ON b.guardian_no = g.user_no
LEFT JOIN priority p ON s.survey_no = p.survey_no
LEFT JOIN common_code c
      ON c.group_id = 'gender'
     AND c.common_id = b.gender
LEFT JOIN common_code cc
      ON cc.group_id = 'priority'
     AND cc.common_id = p.priority_id
WHERE s.survey_no = ?;
`;

module.exports = { list, beneficiaries };
