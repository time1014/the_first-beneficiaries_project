const noticeMapper = require("../database/mappers/notice.mapper");
const { pool } = require("../database/DAO");
const fs = require("fs");

// 공지사항 조회(기관별)
const findAll = async (institutionNo, keyword = "") => {
  return await noticeMapper.selectAllNotice(institutionNo, keyword);
};

// 공지사항 조회(전체 : 시스템관리자)
const findAllAdmin = async (keyword = "") => {
  return await noticeMapper.selectAllNoticeAdmin(keyword);
};

// 공지사항 상세조회
const findInfoByNo = async (noticeNo) => {
  const notice = await noticeMapper.selectNoticeByNo(noticeNo);
  const files = await noticeMapper.selectFilesByNoticeNo(noticeNo);
  return { ...notice, files };
};

// 공지사항 등록
const createInfo = async (noticeData, files) => {
  let conn = null;
  try {
    console.log("noticeData:", noticeData);
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const { user_no, institution_no, notice_title, notice_content } =
      noticeData;

    // notice_no 생성
    const [rows] = await conn.query(
      "SELECT IFNULL(MAX(notice_no), 0) AS maxNo FROM notice",
    );
    const notice_no = rows.maxNo + 1;

    // 공지사항 등록 (매퍼 함수 호출)
    await noticeMapper.insertNotice(conn, {
      notice_no, // 생성한 번호 전달
      user_no,
      institution_no,
      notice_title,
      notice_content,
    });

    // 첨부파일 등록
    if (files && files.length > 0) {
      for (const file of files) {
        // conn.execute 대신 매퍼의 함수를 직접 실행
        await noticeMapper.insertNoticeFile(conn, {
          notice_no: notice_no, // 위에서 생성한 번호 사용
          file_name: file.originalname,
          file_path: file.path,
          file_size: file.size,
        });
      }
    }

    await conn.commit();
    return notice_no;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

// 첨부파일 다운로드
const findFileByNo = async (fileNo) => {
  const file = await noticeMapper.selectFileByFileNo(fileNo);
  return file;
};

// 공지사항 수정
const modifyInfo = async (
  noticeInfo,
  loginUserNo,
  deleteFileNos = [],
  newFiles = [],
) => {
  let conn = null;
  try {
    const noticeNo = noticeInfo.notice_no;

    // 작성자 본인 체크
    const writer = await noticeMapper.selectNoticeWriter(noticeNo);
    if (!writer || String(writer.user_no) !== String(loginUserNo)) {
      return {
        status: false,
        message: "본인이 작성한 글만 수정할 수 있습니다.",
      };
    }
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const updateData = {
      notice_title: noticeInfo.notice_title,
      notice_content: noticeInfo.notice_content,
    };
    // 시스템관리자(e4)일 경우에만 프론트에서 institution_no 보냄
    if (noticeInfo.institution_no) {
      updateData.institution_no = noticeInfo.institution_no;
    }
    const result = await conn.query(`UPDATE notice SET ? WHERE notice_no = ?`, [
      updateData,
      noticeNo,
    ]);
    // 기존 파일 삭제
    if (deleteFileNos.length > 0) {
      for (const fileNo of deleteFileNos) {
        const file = await noticeMapper.selectFileByFileNo(fileNo);

        if (file) {
          if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
          }
          await noticeMapper.deleteNoticeFile(conn, fileNo);
        }
      }
    }
    // 새 파일 추가
    if (newFiles.length > 0) {
      for (const file of newFiles) {
        await noticeMapper.insertNoticeFile(conn, {
          notice_no: noticeNo,
          file_name: file.originalname,
          file_path: file.path,
          file_size: file.size,
        });
      }
    }
    await conn.commit();
    return {
      status: result.affectedRows > 0,
      target: {
        notice_no: noticeNo,
        ...updateData,
      },
    };
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
    return {
      status: false,
      message: "공지사항 수정 중 오류 발생",
    };
  } finally {
    if (conn) conn.release();
  }
};

// 공지사항 삭제
const removeInfo = async (noticeNo, loginUserNo) => {
  const writer = await noticeMapper.selectNoticeWriter(noticeNo);
  if (String(writer.user_no) !== String(loginUserNo)) {
    return { status: false, message: "본인이 작성한 글만 삭제할 수 있습니다." };
  }

  const result = await noticeMapper.deleteNotice(noticeNo);
  let resObj = {
    status: result.affectedRows > 0,
    notice_no: noticeNo,
  };
  return resObj;
};

module.exports = {
  findAll,
  findAllAdmin,
  findInfoByNo,
  createInfo,
  modifyInfo,
  removeInfo,
  findFileByNo,
};
