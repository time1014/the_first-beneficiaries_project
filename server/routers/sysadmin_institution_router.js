const express = require("express");
const router = express.Router();
const service = require("../services/sysadmin_institution_service");

/* =========================
   기관 전체조회
========================= */
router.get("/", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const list = await service.getInstitutionList(keyword);

    res.json({
      retCode: "OK",
      data: list,
    });
  } catch (err) {
    console.error("기관 목록 조회 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관 목록 조회 실패",
    });
  }
});

/* =========================
   기관 상세조회
========================= */
router.get("/:institutionNo", async (req, res) => {
  try {
    const { institutionNo } = req.params;
    const data = await service.getInstitutionByNo(institutionNo);

    res.json({
      retCode: "OK",
      data,
    });
  } catch (err) {
    console.error("기관 상세 조회 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관 상세 조회 실패",
    });
  }
});

/* =========================
   기관 등록
========================= */
router.post("/", async (req, res) => {
  try {
    const result = await service.addInstitution(req.body);

    res.json({
      retCode: "OK",
      data: result,
    });
  } catch (err) {
    console.error("기관 등록 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관 등록 실패",
    });
  }
});

/* =========================
   기관 수정
========================= */
router.put("/:institutionNo", async (req, res) => {
  try {
    const { institutionNo } = req.params;
    const result = await service.editInstitution(institutionNo, req.body);

    res.json({
      retCode: "OK",
      data: result,
    });
  } catch (err) {
    console.error("기관 수정 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관 수정 실패",
    });
  }
});
/* =========================
   기관 선택삭제
========================= */
router.delete("/", async (req, res) => {
  try {
    const { institutionNos } = req.body;
    const result = await service.deleteInstitutionList(institutionNos);

    res.json({
      retCode: "OK",
      data: result,
    });
  } catch (err) {
    console.error("기관 삭제 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: err.message || "기관 삭제 실패",
    });
  }
});

module.exports = router;
