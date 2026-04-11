const express = require("express");
const path = require("path");
const router = express.Router();
const service = require("../services/result_service");
const upload = require("../upload");

/* =========================
   승인된 지원계획 목록 조회
========================= */
// 결과서 작성 대상은 승인된(a1) 지원계획서만
router.get("/approved-plan-list/:surveyNo", async (req, res) => {
  try {
    const { surveyNo } = req.params;
    const list = await service.getApprovedPlanListForResult(surveyNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("승인된 지원계획 목록 조회 실패:", err);
    return res.status(500).json({
      message: "승인된 지원계획 목록 조회 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   결과서 전체 목록 조회
========================= */
// 현재 survey_no 기준으로 결과서 전체 조회
router.get("/survey/:surveyNo", async (req, res) => {
  try {
    const { surveyNo } = req.params;
    const list = await service.getResultListBySurveyNo(surveyNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원결과 전체 조회 실패:", err);
    return res.status(500).json({
      message: "지원결과 전체 조회 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   결과서 목록 조회
========================= */
// 특정 지원계획서 기준 결과서 목록 조회
router.get("/plan/:supportPlanNo", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const list = await service.getResultListByPlanNo(supportPlanNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원결과 목록 조회 실패:", err);
    return res.status(500).json({
      message: "지원결과 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   결과서 임시저장 관련
========================= */

// 임시저장 목록 조회
router.get("/record/list/:supportPlanNo/:writerNo", async (req, res) => {
  try {
    const { supportPlanNo, writerNo } = req.params;
    const list = await service.getResultRecordList(supportPlanNo, writerNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원결과 임시저장 목록 조회 실패:", err);
    return res.status(500).json({
      message: "임시저장 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 1건 조회
router.get("/record/:recordNo", async (req, res) => {
  try {
    const { recordNo } = req.params;
    const item = await service.getResultRecord(recordNo);

    if (!item) {
      return res.status(404).json({
        message: "해당 임시저장 데이터를 찾을 수 없습니다.",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("지원결과 임시저장 상세 조회 실패:", err);
    return res.status(500).json({
      message: "임시저장 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 등록
router.post("/record", async (req, res) => {
  try {
    const { support_plan_no, record_title, record_content, writer_no } =
      req.body;

    if (!support_plan_no || !record_title || !record_content || !writer_no) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    const result = await service.saveResultRecord({
      support_plan_no,
      record_title,
      record_content,
      writer_no,
    });

    return res.status(201).json({
      message: "임시저장되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 임시저장 실패:", err);
    return res.status(500).json({
      message: err.message || "임시저장 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 수정
router.put("/record/:recordNo", async (req, res) => {
  try {
    const { recordNo } = req.params;
    const { record_title, record_content, writer_no } = req.body;

    if (!record_title || !record_content || !writer_no) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    const result = await service.editResultRecord({
      record_no: recordNo,
      record_title,
      record_content,
      writer_no,
    });

    return res.json({
      message: "임시저장이 수정되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 임시저장 수정 실패:", err);
    return res.status(500).json({
      message: err.message || "임시저장 수정 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 삭제
router.delete("/record/:recordNo/:writerNo", async (req, res) => {
  try {
    const { recordNo, writerNo } = req.params;

    const result = await service.removeResultRecord({
      record_no: recordNo,
      writer_no: writerNo,
    });

    return res.json({
      message: "임시저장이 삭제되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 임시저장 삭제 실패:", err);
    return res.status(500).json({
      message: err.message || "임시저장 삭제 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   결과서 첨부파일 관련
========================= */

// 결과서 첨부파일 목록 조회
router.get("/:supportResultNo/files", async (req, res) => {
  try {
    const { supportResultNo } = req.params;
    const list = await service.getResultFiles(supportResultNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원결과 첨부파일 목록 조회 실패:", err);
    return res.status(500).json({
      message: "첨부파일 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 결과서 첨부파일 다운로드
router.get("/file/download/:fileNo", async (req, res) => {
  try {
    const { fileNo } = req.params;
    const fileInfo = await service.getResultFileByNo(fileNo);

    if (!fileInfo) {
      return res.status(404).json({
        message: "해당 파일 정보를 찾을 수 없습니다.",
      });
    }

    const absolutePath = path.resolve(__dirname, "..", fileInfo.file_path);

    return res.download(absolutePath, fileInfo.file_name, (err) => {
      if (err) {
        console.error("지원결과 첨부파일 다운로드 실패:", err);
        if (!res.headersSent) {
          return res.status(500).json({
            message: "파일 다운로드 중 오류가 발생했습니다.",
          });
        }
      }
    });
  } catch (err) {
    console.error("지원결과 첨부파일 다운로드 실패:", err);
    return res.status(500).json({
      message: "파일 다운로드 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   결과서 상세 조회 / 수정 / 삭제
========================= */

// 결과서 상세 1건 조회(수정용)
router.get("/detail/:supportResultNo/:loginUserNo", async (req, res) => {
  try {
    const { supportResultNo, loginUserNo } = req.params;

    const item = await service.getResultByNo(supportResultNo, loginUserNo);

    if (!item) {
      return res.status(404).json({
        message: "수정 가능한 지원결과를 찾을 수 없습니다.",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("지원결과 상세 조회 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

// 검토중(a0)인 결과서 본문 수정
router.put("/:supportResultNo", upload.array("files"), async (req, res) => {
  try {
    const { supportResultNo } = req.params;
    const { writer_no, result_title, result_content, finish, delete_file_nos } =
      req.body;
    const files = req.files || [];

    // 현재 프론트 구조상 writer_no에는 로그인 사용자 번호가 들어옴
    const loginUserNo = writer_no;

    if (
      !loginUserNo ||
      !result_title ||
      !result_content ||
      finish === undefined
    ) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    let deleteFileNos = [];

    if (delete_file_nos) {
      if (Array.isArray(delete_file_nos)) {
        deleteFileNos = delete_file_nos.map((no) => Number(no));
      } else {
        deleteFileNos = [Number(delete_file_nos)];
      }
    }

    const result = await service.editResult({
      support_result_no: supportResultNo,
      login_user_no: loginUserNo,
      result_title,
      result_content,
      finish,
      delete_file_nos: deleteFileNos,
      new_files: files,
    });

    return res.json({
      message: "지원결과가 수정되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 수정 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 수정 중 오류가 발생했습니다.",
    });
  }
});
// 결과서 상세 1건 조회(삭제용)
router.delete("/:supportResultNo/:writerNo", async (req, res) => {
  try {
    const { supportResultNo, writerNo } = req.params;

    const result = await service.removeResult({
      support_result_no: supportResultNo,
      writer_no: writerNo,
    });

    return res.json({
      message: "지원결과가 삭제되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 삭제 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 삭제 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   결과서 등록(승인요청 + 파일첨부)
========================= */

// 결과서 등록
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { support_plan_no, result_title, result_content, writer_no, finish } =
      req.body;
    const files = req.files || [];

    if (
      !support_plan_no ||
      !result_title ||
      !result_content ||
      !writer_no ||
      finish === undefined
    ) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    const result = await service.addResult({
      support_plan_no,
      result_title,
      result_content,
      writer_no,
      finish,
      files,
    });

    return res.status(201).json({
      message: "지원결과가 등록되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 등록 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 등록 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   기관관리자 결과서 승인/반려 관련
========================= */

// 관리자 화면용 결과서 목록 조회
router.get("/admin/list/:supportPlanNo", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const list = await service.getAdminResultListByPlanNo(supportPlanNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("관리자 지원결과 목록 조회 실패:", err);
    return res.status(500).json({
      message: "관리자 지원결과 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 관리자 승인 처리
router.put("/admin/approve/:supportResultNo", async (req, res) => {
  try {
    const { supportResultNo } = req.params;

    const result = await service.approveSupportResult(supportResultNo);

    return res.json({
      message: "지원결과가 승인되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 승인 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 승인 중 오류가 발생했습니다.",
    });
  }
});

// 관리자 반려 처리
router.put("/admin/reject/:supportResultNo", async (req, res) => {
  try {
    const { supportResultNo } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !String(rejection_reason).trim()) {
      return res.status(400).json({
        message: "반려사유를 입력해주세요.",
      });
    }

    const result = await service.rejectSupportResult({
      support_result_no: supportResultNo,
      rejection_reason,
    });

    return res.json({
      message: "지원결과가 반려되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원결과 반려 실패:", err);
    return res.status(500).json({
      message: err.message || "지원결과 반려 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   지원결과 수정이력 조회
========================= */
// 특정 지원결과 번호 기준 수정이력 목록 조회
router.get("/history/:supportResultNo", async (req, res) => {
  try {
    const { supportResultNo } = req.params;
    const list = await service.getResultHistoryList(supportResultNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원결과 수정이력 조회 실패:", err);
    return res.status(500).json({
      message: "지원결과 수정이력 조회 중 오류가 발생했습니다.",
    });
  }
});
module.exports = router;
