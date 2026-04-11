const { pool } = require("../DAO");
const noticeSql = require("../sql/notice");

// 공지사항 조회(기관별)
const selectAllNotice = async (institutionNo, keyword = "") => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.execute(noticeSql.selectAllNotice, [
      institutionNo,
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
    ]);
    return rows || [];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 조회(전체 : 시스템관리자)
const selectAllNoticeAdmin = async (keyword = "") => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.execute(noticeSql.selectAllNoticeAdmin, [
      keyword,
      keyword,
      keyword,
      keyword,
      keyword,
    ]);
    return rows || [];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 상세조회
const selectNoticeByNo = async (no) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(noticeSql.selectNoticeByNo, [no]);
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 첨부파일 조회
const selectFilesByNoticeNo = async (no) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(noticeSql.selectFilesByNoticeNo, [no]);
    return rows || [];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 등록
const insertNotice = async (conn, noticeData) => {
  const { notice_no, user_no, institution_no, notice_title, notice_content } =
    noticeData;

  const result = await conn.execute(noticeSql.insertNotice, [
    notice_no,
    user_no,
    institution_no,
    notice_title,
    notice_content,
  ]);
  return result;
};

// 첨부파일 등록
const insertNoticeFile = async (conn, fileData) => {
  const { notice_no, file_name, file_path, file_size } = fileData;

  const result = await conn.execute(noticeSql.insertNoticeFile, [
    notice_no,
    file_name,
    file_path,
    file_size,
  ]);

  return result;
};

// 첨부파일 다운로드
const selectFileByFileNo = async (fileNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const rows = await conn.execute(
      `SELECT file_no, file_name, file_path 
       FROM files 
       WHERE file_no = ?`,
      [fileNo],
    );

    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 수정
const updateNotice = async (notice) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Auto Commit 해제

    const { notice_no, ...updateData } = notice;

    const result = await conn.query(noticeSql.updateNotice, [
      updateData,
      notice_no,
    ]);

    await conn.commit();

    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

//공지사항 삭제
const deleteNotice = async (noticeNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(noticeSql.deleteNotice, [noticeNo]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 공지 작성자 확인
const selectNoticeWriter = async (noticeNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.execute(noticeSql.selectNoticeWriter, [noticeNo]);
    return rows[0] || null;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

// 첨부파일 삭제
const deleteNoticeFile = async (conn, fileNo) => {
  const result = await conn.execute(noticeSql.deleteNoticeFile, [fileNo]);
  return result;
};

module.exports = {
  selectAllNotice,
  selectAllNoticeAdmin,
  updateNotice,
  selectNoticeByNo,
  insertNotice,
  deleteNotice,
  selectFilesByNoticeNo,
  insertNoticeFile,
  selectFileByFileNo,
  selectNoticeWriter,
  deleteNoticeFile,
};
