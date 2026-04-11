const selectApprovedManagerList = `
SELECT u.user_no
     , u.user_id
     , u.user_name
FROM user u
WHERE u.institution_no = ?
  AND u.role = 'e2'
  AND u.approval = 1
ORDER BY u.user_name
`;

const updateSurveyManagerAssign = `
UPDATE survey_input
SET manager_no = ?
  , sub_manager_no = ?
WHERE survey_no = ?
`;

module.exports = {
  selectApprovedManagerList,
  updateSurveyManagerAssign,
};
