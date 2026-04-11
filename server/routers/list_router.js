const express = require("express");
const router = express.Router();

const listService = require("../services/list_service");

router.get("/lists/:no", async (req, res) => {
  let userNo = req.params.no;
  console.log(userNo);
  let result = await listService.listInfoService(userNo);
  console.log(result);
  res.send(result);
});

router.get("/beneficiaries/:no", async (req, res) => {
  let userNo = req.params.no;
  console.log(userNo);
  let result = await listService.beneficiariesService(userNo);
  console.log(result);
  res.send(result);
});

module.exports = router;
