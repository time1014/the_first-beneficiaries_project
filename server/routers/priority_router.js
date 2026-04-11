const express = require("express");
const router = express.Router();

const priorityService = require("../services/priority_service");

router.get("/priority/:no", async (req, res) => {
  let surveyNo = req.params.no;
  let result = await priorityService.priorityInfoService(surveyNo);
  console.log(result);
  res.send(result);
});

router.post("/priority", async (req, res) => {
  let target = req.body;
  console.log(target);
  let result = await priorityService.createPriorityService(target);
  console.log(result);
  res.send(result);
});

router.put("/priority/:no", async (req, res) => {
  let surveyNo = req.params.no;
  let target = req.body;
  let result = await priorityService.updatePriorityService(surveyNo, target);
  res.send(result);
});

module.exports = router;
