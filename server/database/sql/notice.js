const { pool } = require("../DAO");

// 공지사항 조회(기관별)
const selectAllNotice = `
SELECT n.notice_no,
       n.notice_title,
       n.notice_content,
       i.name,
       u.user_name,
       n.created_at
FROM notice n
JOIN \`user\` u ON n.user_no = u.user_no
JOIN institution i ON n.institution_no = i.institution_no
WHERE n.institution_no = ?
AND (
        ? = ''
        OR n.notice_title LIKE CONCAT('%', ?, '%')
        OR n.notice_content LIKE CONCAT('%', ?, '%')
        OR u.user_name LIKE CONCAT('%', ?, '%')
        OR DATE_FORMAT(n.created_at, '%Y-%m-%d') LIKE CONCAT('%', ?, '%')
      )
ORDER BY n.notice_no DESC
`;

// 공지사항 조회(전체 : 시스템관리자)
const selectAllNoticeAdmin = `
SELECT n.notice_no,
       n.notice_title,
       n.notice_content,
       i.name,
       u.user_name,
       n.created_at
FROM notice n
JOIN \`user\` u ON n.user_no = u.user_no
JOIN institution i ON n.institution_no = i.institution_no
WHERE (
        ? = ''
        OR n.notice_title LIKE CONCAT('%', ?, '%')
        OR n.notice_content LIKE CONCAT('%', ?, '%')
         OR u.user_name LIKE CONCAT('%', ?, '%')
        OR DATE_FORMAT(n.created_at, '%Y-%m-%d') LIKE CONCAT('%', ?, '%')
      )
ORDER BY n.notice_no DESC
`;

// 공지사항 상세조회
const selectNoticeByNo = `
SELECT n.notice_no,
       n.notice_title,
       n.notice_content,
       n.user_no,
       n.institution_no,
       u.user_name,
       n.created_at
FROM notice n
JOIN \`user\` u ON n.user_no = u.user_no
WHERE n.notice_no = ?
`;

// 첨부파일 목록 조회
const selectFilesByNoticeNo = `
SELECT file_no,
       file_name,
       file_path,
       file_size
FROM files
WHERE notice_no = ?
`;

// 공지사항 등록
const insertNotice = `
INSERT INTO notice (
notice_no,
user_no,
institution_no,
notice_title,
notice_content,
created_at
)
VALUES(?,?,?,?,?, NOW())
`;

// 첨부파일 등록
const insertNoticeFile = `
INSERT INTO files(
notice_no,
file_name,
file_path,
file_size
)
VALUES(?,?,?,?)
`;

// 공지사항 수정
const updateNotice = `
UPDATE notice
SET ?
WHERE notice_no = ?
`;

// 공지사항 삭제
const deleteNotice = `
DELETE FROM notice
WHERE notice_no = ?
`;

// 공지 작성자 확인
const selectNoticeWriter = `
SELECT user_no
FROM notice
WHERE notice_no = ?
`;

// 첨부파일 삭제
const deleteNoticeFile = `
DELETE FROM files
WHERE file_no = ?
`;

module.exports = {
  selectAllNotice,
  selectAllNoticeAdmin,
  selectNoticeByNo,
  insertNotice,
  updateNotice,
  deleteNotice,
  selectFilesByNoticeNo,
  insertNoticeFile,
  selectNoticeWriter,
  deleteNoticeFile,
};
