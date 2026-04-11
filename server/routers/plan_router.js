const express = require("express");
const path = require("path");
const router = express.Router();
const service = require("../services/plan_service");
const upload = require("../upload");

/* =========================
   임시저장 관련
========================= */

// 임시저장 목록 조회
router.get("/record/list/:surveyNo/:writerNo", async (req, res) => {
  try {
    const { surveyNo, writerNo } = req.params;
    const list = await service.getPlanRecordList(surveyNo, writerNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원계획 임시저장 목록 조회 실패:", err);
    return res.status(500).json({
      message: "임시저장 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 1건 조회
router.get("/record/:recordNo", async (req, res) => {
  try {
    const { recordNo } = req.params;
    const item = await service.getPlanRecord(recordNo);

    if (!item) {
      return res.status(404).json({
        message: "해당 임시저장 데이터를 찾을 수 없습니다.",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("지원계획 임시저장 상세 조회 실패:", err);
    return res.status(500).json({
      message: "임시저장 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 등록
router.post("/record", async (req, res) => {
  try {
    const { survey_no, record_title, record_content, writer_no } = req.body;

    if (!survey_no || !record_title || !record_content || !writer_no) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    const result = await service.savePlanRecord({
      survey_no,
      record_title,
      record_content,
      writer_no,
    });

    return res.status(201).json({
      message: "임시저장되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 임시저장 실패:", err);
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

    const result = await service.editPlanRecord({
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
    console.error("지원계획 임시저장 수정 실패:", err);
    return res.status(500).json({
      message: err.message || "임시저장 수정 중 오류가 발생했습니다.",
    });
  }
});

// 임시저장 삭제
router.delete("/record/:recordNo/:writerNo", async (req, res) => {
  try {
    const { recordNo, writerNo } = req.params;

    const result = await service.removePlanRecord({
      record_no: recordNo,
      writer_no: writerNo,
    });

    return res.json({
      message: "임시저장이 삭제되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 임시저장 삭제 실패:", err);
    return res.status(500).json({
      message: err.message || "임시저장 삭제 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   지원계획 첨부파일 관련
========================= */

// 지원계획 첨부파일 목록 조회
router.get("/:supportPlanNo/files", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const list = await service.getPlanFiles(supportPlanNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원계획 첨부파일 목록 조회 실패:", err);
    return res.status(500).json({
      message: "첨부파일 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 지원계획 첨부파일 다운로드
router.get("/file/download/:fileNo", async (req, res) => {
  try {
    const { fileNo } = req.params;
    const fileInfo = await service.getPlanFileByNo(fileNo);

    if (!fileInfo) {
      return res.status(404).json({
        message: "해당 파일 정보를 찾을 수 없습니다.",
      });
    }

    // DB에 저장된 상대경로를 절대경로로 변환
    const absolutePath = path.resolve(__dirname, "..", fileInfo.file_path);

    return res.download(absolutePath, fileInfo.file_name, (err) => {
      if (err) {
        console.error("지원계획 첨부파일 다운로드 실패:", err);
        if (!res.headersSent) {
          return res.status(500).json({
            message: "파일 다운로드 중 오류가 발생했습니다.",
          });
        }
      }
    });
  } catch (err) {
    console.error("지원계획 첨부파일 다운로드 실패:", err);
    return res.status(500).json({
      message: "파일 다운로드 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   지원계획 상세 조회 / 수정 / 삭제
========================= */

// 지원계획 상세 1건 조회(수정용)
router.get("/detail/:supportPlanNo/:loginUserNo", async (req, res) => {
  try {
    const { supportPlanNo, loginUserNo } = req.params;

    const item = await service.getPlanByNo(supportPlanNo, loginUserNo);

    if (!item) {
      return res.status(404).json({
        message: "수정 가능한 지원계획을 찾을 수 없습니다.",
      });
    }

    return res.json(item);
  } catch (err) {
    console.error("지원계획 상세 조회 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

/* =========================
   지원계획 수정
========================= */
router.put("/:supportPlanNo", upload.array("files"), async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const { writer_no, plan_title, plan_content, delete_file_nos } = req.body;
    const files = req.files || [];

    // 현재 프론트 구조상 writer_no에는 로그인 사용자 번호가 들어옴
    const loginUserNo = writer_no;

    if (!loginUserNo || !plan_title || !plan_content) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    // delete_file_nos는
    // - 없을 수도 있고
    // - 문자열 1개일 수도 있고
    // - 문자열 배열일 수도 있음
    let deleteFileNos = [];

    if (delete_file_nos) {
      if (Array.isArray(delete_file_nos)) {
        deleteFileNos = delete_file_nos.map((no) => Number(no));
      } else {
        deleteFileNos = [Number(delete_file_nos)];
      }
    }

    const result = await service.editPlan({
      support_plan_no: supportPlanNo,
      login_user_no: loginUserNo,
      plan_title,
      plan_content,
      delete_file_nos: deleteFileNos,
      new_files: files,
    });

    return res.json({
      message: "지원계획이 수정되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 수정 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 수정 중 오류가 발생했습니다.",
    });
  }
});

// 지원계획 삭제
router.delete("/:supportPlanNo/:writerNo", async (req, res) => {
  try {
    const { supportPlanNo, writerNo } = req.params;

    const result = await service.removePlan({
      support_plan_no: supportPlanNo,
      writer_no: writerNo,
    });

    return res.json({
      message: "지원계획이 삭제되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 삭제 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 삭제 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   기관관리자 지원계획 승인/반려 관련
========================= */

// 관리자 화면용 지원계획 목록 조회
router.get("/admin/list/:surveyNo", async (req, res) => {
  try {
    const { surveyNo } = req.params;
    const list = await service.getAdminPlanList(surveyNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("관리자 지원계획 목록 조회 실패:", err);
    return res.status(500).json({
      message: "관리자 지원계획 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 관리자 승인 처리
router.put("/admin/approve/:supportPlanNo", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;

    const result = await service.approveSupportPlan(supportPlanNo);

    return res.json({
      message: "지원계획이 승인되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 승인 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 승인 중 오류가 발생했습니다.",
    });
  }
});

// 관리자 반려 처리
router.put("/admin/reject/:supportPlanNo", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !String(rejection_reason).trim()) {
      return res.status(400).json({
        message: "반려사유를 입력해주세요.",
      });
    }

    const result = await service.rejectSupportPlan({
      support_plan_no: supportPlanNo,
      rejection_reason,
    });

    return res.json({
      message: "지원계획이 반려되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 반려 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 반려 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   지원계획 본 저장(승인요청 + 파일첨부)
========================= */

// 지원계획 목록 조회
router.get("/:surveyNo", async (req, res) => {
  try {
    const { surveyNo } = req.params;
    const list = await service.getPlanList(surveyNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원계획 조회 실패:", err);
    return res.status(500).json({
      message: "지원계획 조회 중 오류가 발생했습니다.",
    });
  }
});

// 지원계획 등록(승인요청 + 파일첨부)
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { survey_no, plan_title, plan_content, writer_no } = req.body;
    const files = req.files || [];

    if (!survey_no || !plan_title || !plan_content || !writer_no) {
      return res.status(400).json({
        message: "필수값이 누락되었습니다.",
      });
    }

    const result = await service.addPlan({
      survey_no,
      plan_title,
      plan_content,
      writer_no,
      files,
    });

    return res.status(201).json({
      message: "지원계획이 등록되었습니다.",
      result,
    });
  } catch (err) {
    console.error("지원계획 등록 실패:", err);
    return res.status(500).json({
      message: err.message || "지원계획 등록 중 오류가 발생했습니다.",
    });
  }
});
/* =========================
   지원계획 수정이력 조회
========================= */
// 특정 지원계획 번호 기준 수정이력 목록 조회
router.get("/history/:supportPlanNo", async (req, res) => {
  try {
    const { supportPlanNo } = req.params;
    const list = await service.getPlanHistoryList(supportPlanNo);
    return res.json(list ?? []);
  } catch (err) {
    console.error("지원계획 수정이력 조회 실패:", err);
    return res.status(500).json({
      message: "지원계획 수정이력 조회 중 오류가 발생했습니다.",
    });
  }
});
module.exports = router;
