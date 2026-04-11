const express = require("express");
const router = express.Router();
const service = require("../services/admin_mypage_service");

// 기관관리자 본인정보 조회
router.get("/:userNo", async (req, res) => {
  try {
    const userNo = Number(req.params.userNo);
    const data = await service.getAdminMyPage(userNo);

    res.json({
      retCode: "OK",
      data,
    });
  } catch (err) {
    console.error("기관관리자 본인정보 조회 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관관리자 본인정보 조회 중 오류가 발생했습니다.",
    });
  }
});

// 기관관리자 본인정보 수정
router.put("/:userNo", async (req, res) => {
  try {
    const adminInfo = {
      ...req.body,
      user_no: Number(req.params.userNo),
    };

    const result = await service.updateAdminMyPage(adminInfo);

    res.json({
      retCode: "OK",
      data: result,
    });
  } catch (err) {
    console.error("기관관리자 본인정보 수정 오류:", err);
    res.status(500).json({
      retCode: "FAIL",
      message: "기관관리자 본인정보 수정 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
