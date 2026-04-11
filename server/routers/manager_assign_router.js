const express = require("express");
const router = express.Router();
const service = require("../services/manager_assign_service");

// 기관번호 기준 담당자 목록 조회
router.get("/managerList/:institutionNo", async (req, res) => {
  try {
    const { institutionNo } = req.params;
    const list = await service.getApprovedManagerList(institutionNo);
    res.json(list);
  } catch (err) {
    console.error("담당자 목록 조회 오류:", err);
    res.status(500).json({ message: "담당자 목록 조회 실패" });
  }
});

// 조사지 담당자 / 부담당자 지정 저장
router.put("/assign", async (req, res) => {
  try {
    const { survey_no, manager_no, sub_manager_no } = req.body;

    await service.updateSurveyManagerAssign(
      manager_no,
      sub_manager_no,
      survey_no,
    );

    res.json({ message: "담당자 지정 완료" });
  } catch (err) {
    console.error("담당자 지정 저장 오류:", err);
    res.status(500).json({ message: "담당자 지정 실패" });
  }
});

module.exports = router;
