const { pool } = require("../DAO");

const InfoPriority = `
SELECT  priority_no
        ,DATE_FORMAT(approval_date, '%Y-%m-%d')  as approval_date
        ,priority_id
        , approval
        , writer_no
        ,reason_rejection
FROM priority
WHERE survey_no = ?;
`;

const createPriority = `
INSERT INTO priority
(priority_id,survey_no, writer_no)
VALUES
(?, ?, ?);
`;

const updatePriority = `
UPDATE priority
SET ?
WHERE priority_no = ?;
`;

module.exports = {
  InfoPriority,
  createPriority,
  updatePriority,
};
