const express = require("express");
const router = express.Router();

const surveyInputtService = require("../services/surveyInput_service");

router.get("/beneficiariesList/:no", async (req, res) => {
  let userNo = req.params.no;
  console.log(userNo);
  let result = await surveyInputtService.beneficiariesList(userNo);
  console.log(result);
  res.send(result);
});

router.get("/beneficiariesInfo/:no", async (req, res) => {
  let userNo = req.params.no;
  console.log(userNo);
  let result = await surveyInputtService.beneficiariesInfo(userNo);
  console.log(result);
  res.send(result);
});

router.get("/surveyQuestion", async (req, res) => {
  let result = await surveyInputtService.surveyQuestionService();
  console.log(result);
  res.send(result);
});

router.post("/createSurvey", async (req, res) => {
  let target = req.body;
  console.log(target);
  let result = await surveyInputtService.createSurveyService(target);
  console.log(result);
  res.send({ result });
});

router.post("/createSurveyInput", async (req, res) => {
  const target = req.body;
  console.log(target);
  let result = await surveyInputtService.createSurveyInputService(target);
  res.send(result);
});

router.get("/surveyQuestion/:no", async (req, res) => {
  let surveyNo = req.params.no;
  console.log(surveyNo);
  let result = await surveyInputtService.survey_QAService(surveyNo);
  console.log(result);
  res.send(result);
});

module.exports = router;
