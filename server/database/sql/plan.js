/* =========================
   지원계획 목록 조회
========================= */
// survey_no 기준으로 지원계획 목록 조회
// files 테이블은 1:N 관계라서 GROUP_CONCAT으로 파일명을 한 줄로 묶음
// writer_no도 같이 내려서 프론트에서 삭제 버튼 조건에 사용
const planList = `
SELECT sp.support_plan_no as support_plan_no
      ,sp.plan_title as title
      ,sp.plan_content as content
      ,sp.plan_approval as approval
      ,cc.code_name as approval_name
      ,sp.plan_reason_rejection as rejection_reason
      ,sp.writer_no as writer_no
      ,GROUP_CONCAT(f.file_name ORDER BY f.file_no SEPARATOR ', ') as filename
      ,u.user_name as name
      ,DATE_FORMAT(sp.created_at, '%Y-%m-%d') as created_at
FROM support_plan sp
JOIN user u
  ON sp.writer_no = u.user_no
LEFT JOIN files f
  ON f.support_plan_no = sp.support_plan_no
LEFT JOIN common_code cc
  ON sp.plan_approval = cc.common_id
WHERE sp.survey_no = ?
GROUP BY sp.support_plan_no
        ,sp.plan_title
        ,sp.plan_content
        ,sp.plan_approval
        ,cc.code_name
        ,sp.plan_reason_rejection
        ,sp.writer_no
        ,u.user_name
        ,sp.created_at
ORDER BY sp.support_plan_no DESC
`;
/* =========================
   survey 기준 대상자 조회
========================= */
// survey_no로 beneficiaries_no를 찾을 때 사용
const findBeneficiaryNoBySurvey = `
SELECT beneficiaries_no
FROM survey_input
WHERE survey_no = ?
`;

/* =========================
   지원계획 등록
========================= */
// 담당자가 승인요청하면 기본 상태는 a0(검토중)
const insertPlan = `
INSERT INTO support_plan (
    survey_no,
    beneficiaries_no,
    plan_title,
    plan_content,
    writer_no,
    plan_approval,
    created_at
) VALUES (?, ?, ?, ?, ?, 'a0', NOW())
`;

/* =========================
   임시저장 관련 SQL
========================= */
// 현재 survey_no + writer_no 기준으로 임시저장 목록 조회
const planRecordList = `
SELECT support_plan_no_record
      ,record_title
      ,record_content
      ,DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
FROM plan_record
WHERE survey_no = ?
  AND writer_no = ?
ORDER BY created_at DESC
`;

// 임시저장 1건 상세 조회
const planRecordOne = `
SELECT support_plan_no_record
      ,survey_no
      ,beneficiaries_no
      ,writer_no
      ,record_title
      ,record_content
      ,DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
FROM plan_record
WHERE support_plan_no_record = ?
`;

// 임시저장 신규 등록
const insertPlanRecord = `
INSERT INTO plan_record (
    survey_no,
    beneficiaries_no,
    writer_no,
    record_title,
    record_content,
    created_at
) VALUES (?, ?, ?, ?, ?, NOW())
`;

// 임시저장 수정
const updatePlanRecord = `
UPDATE plan_record
SET record_title = ?
   ,record_content = ?
WHERE support_plan_no_record = ?
  AND writer_no = ?
`;

// 임시저장 삭제
const deletePlanRecord = `
DELETE FROM plan_record
WHERE support_plan_no_record = ?
  AND writer_no = ?
`;

/* =========================
   첨부파일 저장 관련 SQL
========================= */
// 지원계획 등록/수정 시 새 파일을 files 테이블에 저장
const insertPlanFile = `
INSERT INTO files (
    support_plan_no,
    file_name,
    file_path,
    file_size,
    uploaded_at
) VALUES (?, ?, ?, ?, NOW())
`;

/* =========================
   지원계획 첨부파일 조회 관련 SQL
========================= */
// 특정 지원계획에 연결된 첨부파일 전체 조회
const selectPlanFilesByPlanNo = `
SELECT file_no
      ,file_name
      ,file_path
      ,file_size
      ,DATE_FORMAT(uploaded_at, '%Y-%m-%d %H:%i') as uploaded_at
FROM files
WHERE support_plan_no = ?
ORDER BY file_no ASC
`;

// file_no 기준으로 첨부파일 1건 조회
const selectPlanFileByNo = `
SELECT file_no
      ,file_name
      ,file_path
      ,file_size
FROM files
WHERE file_no = ?
`;

/* =========================
   지원계획 수정/삭제 관련 SQL
========================= */
// 수정 권한 체크 + 수정용 상세 조회
// 검토중(a0) 상태이면서
// 로그인 사용자가 해당 조사지의 담당자(manager_no) 또는
// 부담당자(sub_manager_no)인 경우만 조회 가능
// 담당자 정보는 survey_input에 있으므로 survey_input 기준으로 검사
const selectPlanByNo = `
SELECT sp.support_plan_no
      ,sp.survey_no
      ,sp.beneficiaries_no
      ,sp.plan_title
      ,sp.plan_content
      ,sp.writer_no
      ,sp.plan_approval
      ,si.manager_no
      ,si.sub_manager_no
      ,DATE_FORMAT(sp.created_at, '%Y-%m-%d') as created_at
FROM support_plan sp
JOIN survey_input si
  ON sp.survey_no = si.survey_no
WHERE sp.support_plan_no = ?
  AND sp.plan_approval = 'a0'
  AND (
        si.manager_no = ?
        OR si.sub_manager_no = ?
      )
`;

/* =========================
   지원계획 수정 권한 체크용 SQL
========================= */
// 실제 update 전에
// 현재 로그인 사용자가 해당 조사지의 담당자/부담당자인지 확인
const selectPlanPermissionInfo = `
SELECT sp.support_plan_no
      ,sp.writer_no
      ,sp.plan_approval
      ,si.manager_no
      ,si.sub_manager_no
FROM support_plan sp
JOIN survey_input si
  ON sp.survey_no = si.survey_no
WHERE sp.support_plan_no = ?
`;

// 검토중(a0)인 계획서 본문 수정
// 실제 수정은 support_plan_no + a0 조건으로만 처리하고
// 담당자/부담당자 권한은 서비스에서 먼저 검사
const updatePlan = `
UPDATE support_plan
SET plan_title = ?
   ,plan_content = ?
WHERE support_plan_no = ?
  AND plan_approval = 'a0'
`;

// 검토중(a0)인 본인 계획서만 삭제
const deletePlan = `
DELETE FROM support_plan
WHERE support_plan_no = ?
  AND writer_no = ?
  AND plan_approval = 'a0'
`;

// 수정 화면에서 기존 첨부파일 개별 삭제
const deletePlanFileByNo = `
DELETE FROM files
WHERE file_no = ?
  AND support_plan_no = ?
`;
// 계획서 삭제 전에 연결된 수정이력 전체 삭제
const deletePlanHistoryByPlanNo = `
DELETE FROM support_history
WHERE support_plan_no = ?
`;
// 계획서 삭제 전에 연결된 첨부파일 전체 삭제
const deletePlanFilesByPlanNo = `
DELETE FROM files
WHERE support_plan_no = ?
`;
/* =========================
   기관관리자 지원계획 승인/반려 관련 SQL
========================= */
// 관리자 화면에서 전체 지원계획 목록 조회
// survey_no 기준으로 전체를 보고 싶을 때 사용
const adminPlanList = `
SELECT sp.support_plan_no as support_plan_no
      ,sp.survey_no as survey_no
      ,sp.plan_title as title
      ,sp.plan_content as content
      ,sp.plan_approval as approval
      ,cc.code_name as approval_name
      ,sp.plan_reason_rejection as rejection_reason
      ,GROUP_CONCAT(f.file_name ORDER BY f.file_no SEPARATOR ', ') as filename
      ,u.user_name as name
      ,DATE_FORMAT(sp.created_at, '%Y-%m-%d') as created_at
FROM support_plan sp
JOIN user u
  ON sp.writer_no = u.user_no
LEFT JOIN files f
  ON f.support_plan_no = sp.support_plan_no
LEFT JOIN common_code cc
  ON sp.plan_approval = cc.common_id
WHERE sp.survey_no = ?
GROUP BY sp.support_plan_no
        ,sp.survey_no
        ,sp.plan_title
        ,sp.plan_content
        ,sp.plan_approval
        ,cc.code_name
        ,sp.plan_reason_rejection
        ,u.user_name
        ,sp.created_at
ORDER BY sp.support_plan_no DESC
`;

// 관리자 승인 처리
const approvePlan = `
UPDATE support_plan
SET plan_approval = 'a1'
   ,plan_approval_date = NOW()
   ,plan_reason_rejection = NULL
WHERE support_plan_no = ?
  AND plan_approval = 'a0'
`;

// 관리자 반려 처리
const rejectPlan = `
UPDATE support_plan
SET plan_approval = 'a2'
   ,plan_approval_date = NOW()
   ,plan_reason_rejection = ?
WHERE support_plan_no = ?
  AND plan_approval = 'a0'
`;
/* =========================
   지원계획 등록 권한 확인
========================= */
// survey_no 기준으로 현재 로그인 사용자가
// 담당자(manager_no) 또는 부담당자(sub_manager_no)인지 확인
const selectPlanWritePermission = `
SELECT survey_no
      ,beneficiaries_no
      ,manager_no
      ,sub_manager_no
FROM survey_input
WHERE survey_no = ?
`;
/* =========================
   지원계획 수정이력 저장 관련 SQL
========================= */
// 수정 저장 전에 기존 지원계획 원본을 support_history에 저장
const insertPlanHistory = `
INSERT INTO support_history (
    support_plan_no,
    history_title,
    history_content,
    history_writer,
    approval,
    role,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, NOW())
`;

/* =========================
   지원계획 수정이력 조회 관련 SQL
========================= */
// 특정 지원계획의 수정이력 목록 조회
// 작성자명, 권한명까지 같이 조회해서 모달에 바로 사용
const selectPlanHistoryList = `
SELECT sh.support_history_no as history_no
      ,DATE_FORMAT(sh.created_at, '%Y-%m-%d %H:%i') as created_at
      ,u.user_name as writer
      ,cc.code_name as role
      ,sh.history_title
      ,sh.history_content
      ,sh.approval
FROM support_history sh
JOIN user u
  ON sh.history_writer = u.user_no
LEFT JOIN common_code cc
  ON sh.role = cc.common_id
WHERE sh.support_plan_no = ?
ORDER BY sh.created_at DESC
`;

module.exports = {
  planList,
  findBeneficiaryNoBySurvey,
  insertPlan,
  planRecordList,
  planRecordOne,
  insertPlanRecord,
  updatePlanRecord,
  deletePlanRecord,
  insertPlanFile,
  selectPlanFilesByPlanNo,
  selectPlanFileByNo,
  selectPlanByNo,
  updatePlan,
  deletePlan,
  deletePlanFileByNo,
  deletePlanFilesByPlanNo,
  adminPlanList,
  approvePlan,
  rejectPlan,
  selectPlanPermissionInfo,
  selectPlanWritePermission,
  insertPlanHistory,
  selectPlanHistoryList,
  deletePlanHistoryByPlanNo,
};
