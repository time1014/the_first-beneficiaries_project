const express = require("express");
const institutionService = require("../services/institution_service");
const router = express.Router();

// 기관정보 조회
router.get("/admin/institutioninfo/:institution_no", async (req, res) => {
  try {
    let institutionNo = req.params.institution_no;
    let result = await institutionService.findAll(institutionNo);
    res.json(result || {});
  } catch (err) {
    console.log(err);
  }
});

// 기관 목록 전체조회(셀렉박스용)
router.get("/institution", async (req, res) => {
  try {
    let result = await institutionService.findInstitutionList();
    res.json(result || []);
  } catch (err) {
    console.log(err);
  }
});

// 기관정보 수정
router.put("/admin/institutioninfo", async (req, res) => {
  try {
    let target = req.body;
    let result = await institutionService.modifyInfo(target);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
