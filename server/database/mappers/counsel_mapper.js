const { pool } = require("../DAO");
const counselSql = require("../sql/counsel");
const fs = require("fs");
const path = require("path");

const counsel = async (surNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(counselSql.counselList, [surNo]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const counselInsert = async (surNo , beneNo, userNo,title, content , date,  files) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
        let result = await conn.query(counselSql.counselInsertSql, [surNo,beneNo,userNo,title,content,date]);

    const counselNo = result.insertId;

    if (files && files.length > 0) {
      for (let file of files) {
        await conn.query(counselSql.fileAdd, [counselNo,file.filename,file.path,file.size]);
      }
    }

    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};


const counselUpdate = async (no, title, content,date ,name, role, files, deleteFiles) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    //수정
    await conn.query(counselSql.counselUpdateSql, [title, content,date,no]);
    //수정 이력
    await conn.query(counselSql.counselHistory, [
      no, name, title, content, role
    ]);

    if (deleteFiles.length > 0) {
      for (let fileName of deleteFiles) {

        //수정때 파일 삭제
        await conn.query(counselSql.counselFileDeleteSql,[no, fileName]);


        const filePath = path.join("uploads", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    //수정 파일 추가
    if (files && files.length > 0) {
      for (let file of files) {
        await conn.query(counselSql.fileAdd, [
          no,
          file.filename,
          file.path,
          file.size
        ]);
      }
    }
    await conn.commit();
    return { success: true };

  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
  } finally {
    if (conn) conn.release();
  }
};

const counselHistory = async (cNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(counselSql.counselHistorySelect, [cNo]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};


const counselDelete = async (no) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(counselSql.counselDeleteSql, [no]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};


const counselSave = async (date, title, content, surNo, wNo,beneNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(counselSql.counselSaveSql, [date, title, content, surNo, wNo,beneNo]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const counselSaveList = async (surNo ,wNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(counselSql.counselSaveInfoSql, [surNo, wNo]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const counselSaveDelete  = async (sNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(counselSql.counselSaveDeleteSql, [sNo]);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};





const counselBeneInfo = async (beneNo) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(counselSql.beneList, [beneNo]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};


module.exports = {counsel,counselInsert,counselUpdate,counselHistory,counselDelete,counselSave,counselSaveList,counselSaveDelete,counselBeneInfo}