const express = require("express");
const router = express.Router();

const surveyService = require("../services/survey_service");

// 조회
router.get("/main", async (req, res) => {
  let mainNo = req.params.no;
  console.log(mainNo);
  let result = await surveyService.mainInfoService(mainNo);
  console.log(result);
  res.send(result);
});

router.get("/sub/:no", async (req, res) => {
  let subNo = req.params.no;
  console.log(subNo);
  let result = await surveyService.subInfoService(subNo);
  console.log(result);
  res.send(result);
});

router.get("/question/:no", async (req, res) => {
  let questionNo = req.params.no;
  console.log(questionNo);
  let result = await surveyService.questionInfoService(questionNo);
  console.log(result);
  res.send(result);
});

// 등록
router.post("/main", async (req, res) => {
  let target = req.body;
  console.log(target);
  let result = await surveyService.createMainService(target);
  res.send(result);
});

router.post("/sub", async (req, res) => {
  let target = req.body;
  let result = await surveyService.createSubService(target);
  res.send(result);
});

router.post("/question", async (req, res) => {
  let target = req.body;
  let result = await surveyService.createQuestionService(target);
  res.send(result);
});

// 수정
router.put("/main/:no", async (req, res) => {
  let mainNo = req.params.no;
  let target = req.body;
  let result = await surveyService.updateMainService(mainNo, target);
  res.send(result);
});

router.put("/sub/:no", async (req, res) => {
  let subNo = req.params.no;
  let target = req.body;
  let result = await surveyService.updateSubService(subNo, target);
  res.send(result);
});

router.put("/question/:no", async (req, res) => {
  let questionNo = req.params.no;
  let target = req.body;
  let result = await surveyService.updateQuestionService(questionNo, target);
  res.send(result);
});

// 삭제
router.delete("/main/:no", async (req, res) => {
  let mainNo = req.params.no;
  let result = await surveyService.deleteMainService(mainNo);
  res.send(result);
});

router.delete("/sub/:no", async (req, res) => {
  let subNo = req.params.no;
  let result = await surveyService.deleteSubService(subNo);
  res.send(result);
});

router.delete("/question/:no", async (req, res) => {
  let questionNo = req.params.no;
  let result = await surveyService.deleteQuestionService(questionNo);
  res.send(result);
});

router.post("/save_all", async (req, res) => {
  let target = req.body;
  let result = await surveyService.saveAllService(target);
  res.send(result);
});

module.exports = router;
