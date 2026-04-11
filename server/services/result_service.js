const dao = require("../database/DAO");
const sql = require("../database/sql/result");
const { get } = require("../routers/result_router");

/* =========================
   승인된 지원계획 목록 조회
========================= */
// 결과서를 작성할 수 있는 대상은 승인된(a1) 지원계획서만
const getApprovedPlanListForResult = async (surveyNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.approvedPlanListForResult, [surveyNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 목록 조회
========================= */
// 특정 지원계획서에 연결된 결과서 목록 조회
const getResultListByPlanNo = async (supportPlanNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.resultListByPlanNo, [supportPlanNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 등록(승인요청 + 파일 저장)
========================= */
// 결과서 저장 전
// 현재 로그인 사용자가 해당 지원계획의 담당자/부담당자인지 확인
// 승인된(a1) 지원계획에 대해서만 결과서 작성 가능
const addResult = async ({
  support_plan_no,
  result_title,
  result_content,
  writer_no,
  finish,
  files = [],
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    /* -------------------------
       1. 등록 권한 확인
    ------------------------- */
    const permissionRows = await conn.query(sql.selectResultWritePermission, [
      support_plan_no,
    ]);

    if (!permissionRows.length) {
      throw new Error("해당 지원계획 정보를 찾을 수 없습니다.");
    }

    const planInfo = permissionRows[0];

    const isAssignedUser =
      Number(planInfo.manager_no) === Number(writer_no) ||
      Number(planInfo.sub_manager_no) === Number(writer_no);

    if (!isAssignedUser) {
      throw new Error(
        "해당 조사지의 담당자 또는 부담당자만 지원결과를 작성할 수 있습니다.",
      );
    }

    if (planInfo.plan_approval !== "a1") {
      throw new Error(
        "승인된 지원계획에 대해서만 결과서를 작성할 수 있습니다.",
      );
    }
    /* -------------------------
   2. 이미 종결 승인된 결과서 존재 여부 확인
------------------------- */
    const closedRows = await conn.query(sql.countClosedApprovedResultByPlan, [
      support_plan_no,
    ]);

    const closedCount = Number(closedRows[0]?.cnt || 0);

    if (closedCount > 0) {
      throw new Error(
        "이미 종결 승인된 지원결과가 있어 더 이상 결과서를 작성할 수 없습니다.",
      );
    }
    const beneficiaries_no = planInfo.beneficiaries_no;

    /* -------------------------
       3. 결과서 저장
    ------------------------- */
    const resultInsert = await conn.query(sql.insertResult, [
      support_plan_no,
      writer_no,
      result_title,
      result_content,
      beneficiaries_no,
      finish,
    ]);

    const support_result_no = resultInsert.insertId;

    if (!support_result_no) {
      throw new Error("지원결과 저장 후 번호를 가져오지 못했습니다.");
    }

    /* -------------------------
       4. 첨부파일 저장
    ------------------------- */
    if (files && files.length > 0) {
      for (const file of files) {
        await conn.query(sql.insertResultFile, [
          support_result_no,
          file.filename,
          file.path,
          file.size,
        ]);
      }
    }

    await conn.commit();

    return {
      support_result_no,
      file_count: files.length,
    };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 임시저장 목록 조회
========================= */
// 특정 지원계획서 + 작성자 기준으로 임시저장 목록 조회
const getResultRecordList = async (supportPlanNo, writerNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.resultRecordList, [
      supportPlanNo,
      writerNo,
    ]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 임시저장 1건 조회
========================= */
// 임시저장 1건 상세 조회
const getResultRecord = async (recordNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.resultRecordOne, [recordNo]);
    return rows[0] ?? null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 임시저장 신규 등록
========================= */
// result_record에 신규 임시저장
const saveResultRecord = async ({
  support_plan_no,
  record_title,
  record_content,
  writer_no,
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.insertResultRecord, [
      support_plan_no,
      writer_no,
      record_title,
      record_content,
    ]);

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 임시저장 수정
========================= */
// 이미 저장된 임시저장 수정
const editResultRecord = async ({
  record_no,
  record_title,
  record_content,
  writer_no,
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.updateResultRecord, [
      record_title,
      record_content,
      record_no,
      writer_no,
    ]);

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 임시저장 삭제
========================= */
// 임시저장 1건 삭제
const removeResultRecord = async ({ record_no, writer_no }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.deleteResultRecord, [
      record_no,
      writer_no,
    ]);

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 첨부파일 목록 조회
========================= */
// support_result_no 기준으로 첨부파일 목록 조회
const getResultFiles = async (supportResultNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectResultFilesByResultNo, [
      supportResultNo,
    ]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 첨부파일 1건 조회
========================= */
// file_no 기준으로 파일 1건 조회
const getResultFileByNo = async (fileNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectResultFileByNo, [fileNo]);
    return rows[0] ?? null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   지원결과 상세 1건 조회
========================= */
// 수정 버튼 클릭 시 입력폼에 채울 데이터 조회
// 검토중(a0) 상태이면서 로그인 사용자가 담당자/부담당자일 때만 조회 가능
const getResultByNo = async (supportResultNo, loginUserNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const rows = await conn.query(sql.selectResultByNo, [
      supportResultNo,
      loginUserNo,
      loginUserNo,
    ]);

    if (!rows.length) {
      return null;
    }

    const result = rows[0];

    // 기존 첨부파일 목록도 같이 반환
    const fileRows = await conn.query(sql.selectResultFilesByResultNo, [
      supportResultNo,
    ]);

    return {
      ...result,
      files: fileRows ?? [],
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 수정
========================= */
// 검토중(a0) 상태이면서 담당자/부담당자만 수정 가능
// 수정 전 원본은 result_history에 저장
const editResult = async ({
  support_result_no,
  login_user_no,
  result_title,
  result_content,
  finish,
  delete_file_nos = [],
  new_files = [],
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    /* -------------------------
       1. 수정 권한 확인
    ------------------------- */
    const permissionRows = await conn.query(sql.selectResultPermissionInfo, [
      support_result_no,
    ]);

    if (!permissionRows.length) {
      throw new Error("해당 지원결과 정보를 찾을 수 없습니다.");
    }

    const permissionInfo = permissionRows[0];

    const isAssignedUser =
      Number(permissionInfo.manager_no) === Number(login_user_no) ||
      Number(permissionInfo.sub_manager_no) === Number(login_user_no);

    if (!isAssignedUser) {
      throw new Error("수정 권한이 없습니다.");
    }

    if (permissionInfo.result_approval !== "a0") {
      throw new Error("검토중인 지원결과만 수정할 수 있습니다.");
    }

    /* -------------------------
       2. 수정 전 원본 이력 저장
    ------------------------- */
    const currentResultRows = await conn.query(
      sql.selectCurrentResultForHistory,
      [support_result_no],
    );

    if (!currentResultRows.length) {
      throw new Error("수정할 지원결과 원본을 찾을 수 없습니다.");
    }

    const currentResult = currentResultRows[0];

    await conn.query(sql.insertResultHistory, [
      currentResult.support_result_no,
      currentResult.result_title,
      currentResult.result_content,
      login_user_no,
      currentResult.result_approval,
      String(currentResult.finish),
      "e2",
    ]);

    /* -------------------------
       3. 본문 수정
    ------------------------- */
    const updateResult = await conn.query(sql.updateResult, [
      result_title,
      result_content,
      finish,
      support_result_no,
    ]);

    if (!updateResult.affectedRows) {
      throw new Error(
        "수정 가능한 지원결과가 없거나 이미 처리된 결과서입니다.",
      );
    }

    /* -------------------------
       4. 삭제할 기존 첨부파일 처리
    ------------------------- */
    if (delete_file_nos && delete_file_nos.length > 0) {
      for (const fileNo of delete_file_nos) {
        await conn.query(sql.deleteResultFileByNo, [fileNo, support_result_no]);
      }
    }

    /* -------------------------
       5. 새 첨부파일 추가
    ------------------------- */
    if (new_files && new_files.length > 0) {
      for (const file of new_files) {
        await conn.query(sql.insertResultFile, [
          support_result_no,
          file.filename,
          file.path,
          file.size,
        ]);
      }
    }

    await conn.commit();

    return {
      support_result_no,
      deleted_file_count: delete_file_nos.length,
      added_file_count: new_files.length,
    };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   결과서 삭제
========================= */
// 검토중(a0)인 본인 결과서만 삭제
// 삭제 전 연결된 첨부파일도 함께 삭제
const removeResult = async ({ support_result_no, writer_no }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    // 1. 연결된 첨부파일 전체 삭제
    await conn.query(sql.deleteResultFilesByResultNo, [support_result_no]);

    // 2. 결과서 삭제
    const deleteResult = await conn.query(sql.deleteResult, [
      support_result_no,
      writer_no,
    ]);

    if (!deleteResult.affectedRows) {
      throw new Error(
        "삭제 가능한 지원결과가 없거나 이미 처리된 결과서입니다.",
      );
    }

    await conn.commit();

    return deleteResult;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관관리자 결과서 목록 조회
========================= */
// 특정 지원계획서 기준으로 관리자 화면용 결과서 전체 조회
const getAdminResultListByPlanNo = async (supportPlanNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.adminResultListByPlanNo, [supportPlanNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관관리자 결과서 승인
========================= */
// 검토중(a0)인 결과서만 승인 처리
// 종결(finish=1) 결과 승인 시
// 같은 지원계획에 이미 종결 승인된 결과가 있으면 승인 불가
const approveSupportResult = async (supportResultNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    /* -------------------------
       1. 현재 승인 대상 결과서 정보 조회
    ------------------------- */
    const infoRows = await conn.query(sql.selectResultApproveInfo, [
      supportResultNo,
    ]);

    if (!infoRows.length) {
      throw new Error("해당 지원결과 정보를 찾을 수 없습니다.");
    }

    const resultInfo = infoRows[0];

    if (resultInfo.result_approval !== "a0") {
      throw new Error(
        "승인 가능한 지원결과가 없거나 이미 처리된 결과서입니다.",
      );
    }

    /* -------------------------
       2. 종결 결과 중복 승인 여부 확인
    ------------------------- */
    if (Number(resultInfo.finish) === 1) {
      const closedRows = await conn.query(sql.countApprovedClosedResultByPlan, [
        resultInfo.support_plan_no,
        supportResultNo,
      ]);

      const closedCount = Number(closedRows[0]?.cnt || 0);

      if (closedCount > 0) {
        throw new Error(
          "해당 지원계획에는 이미 종결 승인된 결과서가 있어 추가 종결 승인을 할 수 없습니다.",
        );
      }
    }

    /* -------------------------
       3. 승인 처리
    ------------------------- */
    const result = await conn.query(sql.approveResult, [supportResultNo]);

    if (!result.affectedRows) {
      throw new Error(
        "승인 가능한 지원결과가 없거나 이미 처리된 결과서입니다.",
      );
    }

    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   기관관리자 결과서 반려
========================= */
// 검토중(a0)인 결과서만 반려 처리
// 반려사유는 필수로 받음
const rejectSupportResult = async ({ support_result_no, rejection_reason }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.rejectResult, [
      rejection_reason,
      support_result_no,
    ]);

    if (!result.affectedRows) {
      throw new Error(
        "반려 가능한 지원결과가 없거나 이미 처리된 결과서입니다.",
      );
    }

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
/* =========================
   결과서 전체 목록 조회
========================= */
// 현재 survey_no에 속한 결과서 전체 조회
const getResultListBySurveyNo = async (surveyNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.resultListBySurveyNo, [surveyNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
/* =========================
   지원결과 수정이력 조회
========================= */
// 특정 지원결과 번호 기준 수정이력 목록 조회
const getResultHistoryList = async (supportResultNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectResultHistoryList, [
      supportResultNo,
    ]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getApprovedPlanListForResult,
  getResultListByPlanNo,
  addResult,
  getResultRecordList,
  getResultRecord,
  saveResultRecord,
  editResultRecord,
  removeResultRecord,
  getResultFiles,
  getResultFileByNo,
  getResultByNo,
  editResult,
  removeResult,
  getAdminResultListByPlanNo,
  approveSupportResult,
  rejectSupportResult,
  getResultListBySurveyNo,
  getResultHistoryList,
};
