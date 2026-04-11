const express = require("express");
const router = express.Router();
const service = require("../services/institution_mypage_service");

// 조회
router.get("/:userNo", async (req, res) => {
  try {
    const userNo = req.params.userNo;
    const result = await service.getInstitutionMyPage(userNo);
    res.json(result);
  } catch (err) {
    console.error("기관담당자 마이페이지 조회 오류:", err);
    console.error("에러 메시지:", err.message);
    console.error("에러 스택:", err.stack);

    res.status(500).json({
      retCode: "FAIL",
      message: "조회 중 오류가 발생했습니다.",
    });
  }
});

// 수정
router.put("/:userNo", async (req, res) => {
  try {
    const userNo = req.params.userNo;
    const result = await service.updateInstitutionMyPage(userNo, req.body);
    res.json(result);
  } catch (err) {
    console.error("기관담당자 마이페이지 수정 오류:", err);
    console.error("에러 메시지:", err.message);
    console.error("에러 스택:", err.stack);

    res.status(500).json({
      retCode: "FAIL",
      message: "수정 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
