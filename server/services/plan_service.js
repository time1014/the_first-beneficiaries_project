const dao = require("../database/DAO");
const sql = require("../database/sql/plan");

/* =========================
   지원계획 목록 조회
========================= */
// survey_no 기준으로 지원계획 목록 조회
const getPlanList = async (surveyNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.planList, [surveyNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   지원계획 등록(승인요청 + 파일 저장)
========================= */
// support_plan 저장 전
// 현재 로그인 사용자가 해당 조사지의 담당자/부담당자인지 확인
const addPlan = async ({
  survey_no,
  plan_title,
  plan_content,
  writer_no,
  files = [],
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    /* -------------------------
       1. 조사지 정보 + 권한 확인
    ------------------------- */
    const permissionRows = await conn.query(sql.selectPlanWritePermission, [
      survey_no,
    ]);

    if (!permissionRows.length) {
      throw new Error("해당 조사지 정보를 찾을 수 없습니다.");
    }

    const surveyInfo = permissionRows[0];

    const isAssignedUser =
      Number(surveyInfo.manager_no) === Number(writer_no) ||
      Number(surveyInfo.sub_manager_no) === Number(writer_no);

    if (!isAssignedUser) {
      throw new Error(
        "해당 조사지의 담당자 또는 부담당자만 지원계획을 작성할 수 있습니다.",
      );
    }

    const beneficiaries_no = surveyInfo.beneficiaries_no;

    /* -------------------------
       2. 지원계획 저장
    ------------------------- */
    const planResult = await conn.query(sql.insertPlan, [
      survey_no,
      beneficiaries_no,
      plan_title,
      plan_content,
      writer_no,
    ]);

    const support_plan_no = planResult.insertId;

    if (!support_plan_no) {
      throw new Error("지원계획 저장 후 번호를 가져오지 못했습니다.");
    }

    /* -------------------------
       3. 첨부파일 저장
    ------------------------- */
    if (files && files.length > 0) {
      for (const file of files) {
        await conn.query(sql.insertPlanFile, [
          support_plan_no,
          file.filename,
          file.path,
          file.size,
        ]);
      }
    }

    await conn.commit();

    return {
      support_plan_no,
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
   임시저장 목록 조회
========================= */
// 현재 survey_no + writer_no 기준으로 임시저장 목록 조회
const getPlanRecordList = async (surveyNo, writerNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.planRecordList, [surveyNo, writerNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   임시저장 1건 조회
========================= */
// 임시저장 1건 상세 조회
const getPlanRecord = async (recordNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.planRecordOne, [recordNo]);
    return rows[0] ?? null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   임시저장 신규 등록
========================= */
// plan_record에 신규 임시저장
const savePlanRecord = async ({
  survey_no,
  record_title,
  record_content,
  writer_no,
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    // survey_no로 beneficiaries_no 조회
    const surveyRows = await conn.query(sql.findBeneficiaryNoBySurvey, [
      survey_no,
    ]);

    if (!surveyRows.length) {
      throw new Error("해당 조사지 정보를 찾을 수 없습니다.");
    }

    const beneficiaries_no = surveyRows[0].beneficiaries_no;

    const result = await conn.query(sql.insertPlanRecord, [
      survey_no,
      beneficiaries_no,
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
   임시저장 수정
========================= */
// 이미 저장된 임시저장 수정
const editPlanRecord = async ({
  record_no,
  record_title,
  record_content,
  writer_no,
}) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.updatePlanRecord, [
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
   임시저장 삭제
========================= */
// 임시저장 1건 삭제
const removePlanRecord = async ({ record_no, writer_no }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.deletePlanRecord, [
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
   지원계획 첨부파일 목록 조회
========================= */
// support_plan_no 기준으로 첨부파일 목록 조회
const getPlanFiles = async (supportPlanNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectPlanFilesByPlanNo, [supportPlanNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   지원계획 첨부파일 1건 조회
========================= */
// file_no 기준으로 파일 1건 조회
const getPlanFileByNo = async (fileNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectPlanFileByNo, [fileNo]);
    return rows[0] ?? null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   지원계획 상세 1건 조회
========================= */
// 수정 버튼 클릭 시 입력폼에 채울 데이터 조회
// 검토중(a0) 상태이면서 로그인 사용자가 담당자/부담당자일 때만 조회 가능
const getPlanByNo = async (supportPlanNo, loginUserNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const rows = await conn.query(sql.selectPlanByNo, [
      supportPlanNo,
      loginUserNo,
      loginUserNo,
    ]);

    if (!rows.length) {
      return null;
    }

    const plan = rows[0];

    const fileRows = await conn.query(sql.selectPlanFilesByPlanNo, [
      supportPlanNo,
    ]);

    return {
      ...plan,
      files: fileRows ?? [],
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
   지원계획 수정
========================= */
// 검토중(a0) 상태이면서 담당자/부담당자만 수정 가능
// 제목/내용 수정 + 기존 파일 삭제 + 새 파일 추가
const editPlan = async ({
  support_plan_no,
  login_user_no,
  plan_title,
  plan_content,
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
    const permissionRows = await conn.query(sql.selectPlanPermissionInfo, [
      support_plan_no,
    ]);

    if (!permissionRows.length) {
      throw new Error("해당 지원계획 정보를 찾을 수 없습니다.");
    }

    const permissionInfo = permissionRows[0];

    const isAssignedUser =
      Number(permissionInfo.manager_no) === Number(login_user_no) ||
      Number(permissionInfo.sub_manager_no) === Number(login_user_no);

    if (!isAssignedUser) {
      throw new Error("수정 권한이 없습니다.");
    }

    if (permissionInfo.plan_approval !== "a0") {
      throw new Error("검토중인 지원계획만 수정할 수 있습니다.");
    }
    /* -------------------------
    2. 수정 전 원본 이력 저장
    ------------------------- */
    // 현재 수정 대상 원본 조회
    const currentPlanRows = await conn.query(
      `
  SELECT support_plan_no
        ,plan_title
        ,plan_content
        ,writer_no
        ,plan_approval
  FROM support_plan
  WHERE support_plan_no = ?
  `,
      [support_plan_no],
    );

    if (!currentPlanRows.length) {
      throw new Error("수정할 지원계획 원본을 찾을 수 없습니다.");
    }

    const currentPlan = currentPlanRows[0];

    // 수정 전 원본 내용을 support_history에 저장
    // history_writer는 '원래 작성자'가 아니라 '실제로 수정한 사람'이어야 함
    await conn.query(sql.insertPlanHistory, [
      currentPlan.support_plan_no,
      currentPlan.plan_title,
      currentPlan.plan_content,
      login_user_no,
      currentPlan.plan_approval,
      "e2",
    ]);
    /* -------------------------
        2. 본문 수정
    ------------------------- */
    const updateResult = await conn.query(sql.updatePlan, [
      plan_title,
      plan_content,
      support_plan_no,
    ]);

    if (!updateResult.affectedRows) {
      throw new Error(
        "수정 가능한 지원계획이 없거나 이미 처리된 계획서입니다.",
      );
    }

    /* -------------------------
        3. 삭제할 기존 첨부파일 처리
    ------------------------- */
    if (delete_file_nos && delete_file_nos.length > 0) {
      for (const fileNo of delete_file_nos) {
        await conn.query(sql.deletePlanFileByNo, [fileNo, support_plan_no]);
      }
    }

    /* -------------------------
        4. 새 첨부파일 추가
    ------------------------- */
    if (new_files && new_files.length > 0) {
      for (const file of new_files) {
        await conn.query(sql.insertPlanFile, [
          support_plan_no,
          file.filename,
          file.path,
          file.size,
        ]);
      }
    }

    await conn.commit();

    return {
      support_plan_no,
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
    지원계획 삭제
========================= */
// 검토중(a0)인 본인 계획서만 삭제
// 삭제 전 연결된 첨부파일, 수정이력도 함께 삭제
const removePlan = async ({ support_plan_no, writer_no }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    await conn.beginTransaction();

    // 1. 첨부파일 먼저 삭제
    await conn.query(sql.deletePlanFilesByPlanNo, [support_plan_no]);

    // 2. 수정이력 먼저 삭제
    await conn.query(sql.deletePlanHistoryByPlanNo, [support_plan_no]);

    // 3. 마지막으로 지원계획 삭제
    const deleteResult = await conn.query(sql.deletePlan, [
      support_plan_no,
      writer_no,
    ]);

    if (!deleteResult.affectedRows) {
      throw new Error(
        "삭제 가능한 지원계획이 없거나 이미 처리된 계획서입니다.",
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
    기관관리자 지원계획 목록 조회
========================= */
// 관리자 화면에서 survey_no 기준으로 전체 지원계획 목록 조회
const getAdminPlanList = async (surveyNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.adminPlanList, [surveyNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* =========================
    기관관리자 지원계획 승인
========================= */
// 검토중(a0)인 계획서만 승인 처리
const approveSupportPlan = async (supportPlanNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.approvePlan, [supportPlanNo]);

    if (!result.affectedRows) {
      throw new Error(
        "승인 가능한 지원계획이 없거나 이미 처리된 계획서입니다.",
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
    기관관리자 지원계획 반려
========================= */
// 검토중(a0)인 계획서만 반려 처리
// 반려사유는 필수로 받음
const rejectSupportPlan = async ({ support_plan_no, rejection_reason }) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();

    const result = await conn.query(sql.rejectPlan, [
      rejection_reason,
      support_plan_no,
    ]);

    if (!result.affectedRows) {
      throw new Error(
        "반려 가능한 지원계획이 없거나 이미 처리된 계획서입니다.",
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
    지원계획 수정이력 조회
========================= */
// 특정 지원계획 번호 기준 수정이력 목록 조회
const getPlanHistoryList = async (supportPlanNo) => {
  let conn;
  try {
    conn = await dao.pool.getConnection();
    const rows = await conn.query(sql.selectPlanHistoryList, [supportPlanNo]);
    return rows ?? [];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
module.exports = {
  getPlanList,
  addPlan,
  getPlanRecordList,
  getPlanRecord,
  savePlanRecord,
  editPlanRecord,
  removePlanRecord,
  getPlanFiles,
  getPlanFileByNo,
  getPlanByNo,
  editPlan,
  removePlan,
  getAdminPlanList,
  approveSupportPlan,
  rejectSupportPlan,
  getPlanHistoryList,
};
