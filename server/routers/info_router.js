const express = require("express");
const router = express.Router();

const infoService = require("../services/info_service");

router.get("/managerList/:no", async (req, res) => {
  let insNo = req.params.no;
  let result = await infoService.managerInfoService(insNo);
  res.send(result);
});

router.get("/adminList/:no", async (req, res) => {
  let insNo = req.params.no;
  let result = await infoService.adminInfoService(insNo);
  res.send(result);
});

router.get("/institutionList", async (req, res) => {
  let result = await infoService.insInfoService();
  res.send(result);
});

router.put("/managerUpdate/:no", async (req, res) => {
  let mNo = req.params.no;
  let uName = req.body.name;
  let uTel = req.body.tel;
  let uEmail = req.body.email;
  let uIns = req.body.ins_no;
  let result = await infoService.managerUpdateService(
    mNo,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  res.send(result);
});

router.put("/adminUpdate/:no", async (req, res) => {
  let mNo = req.params.no;
  let uName = req.body.name;
  let uTel = req.body.tel;
  let uEmail = req.body.email;
  let uIns = req.body.ins_no;
  let result = await infoService.adminUpdateService(
    mNo,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  res.send(result);
});

router.post("/managerInsert", async (req, res) => {
  let uId = req.body.user_id;
  let uPass = req.body.password;
  let uName = req.body.name;
  let uTel = req.body.tel;
  let uEmail = req.body.email;
  let uIns = req.body.ins_no;

  let result = await infoService.managerInsertService(
    uId,
    uPass,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  res.send(result);
});

router.post("/adminInsert", async (req, res) => {
  let uId = req.body.user_id;
  let uPass = req.body.password;
  let uName = req.body.name;
  let uTel = req.body.tel;
  let uEmail = req.body.email;
  let uIns = req.body.ins_no;

  let result = await infoService.adminInsertService(
    uId,
    uPass,
    uName,
    uTel,
    uEmail,
    uIns,
  );
  res.send(result);
});

module.exports = router;
