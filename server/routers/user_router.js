const express = require("express");
const router = express.Router();

const userService = require("../services/user_service");

router.post("/users", async (req, res) => {
  let target = req.body;
  let result = await userService.createUser(target);
  res.send(result);
});

router.post("/login", async (req, res) => {
  const { user_id, user_pw } = req.body;
  let result = await userService.loginService(user_id, user_pw);
  res.send(result);
});

router.get("/approval/:no", async (req, res) => {
  let insNo = req.params.no;
  let result = await userService.approvalAccess(insNo);
  res.send(result);
});
router.get("/admin-approval", async (req, res) => {
  let result = await userService.approvalByAdminAccess();
  res.send(result);
});

router.put("/access", async (req, res) => {
  const userId = req.body;
  let result = await userService.signAccess(userId);
  if (result.affectedRows === 1) {
    res.send({ update: "success" });
  }
  res.send({ update: "fail" });
});

router.delete("/access/refuse", async (req, res) => {
  const userId = req.body;
  let result = await userService.signRefuseService(userId);
  console.log(result);
  if (result.affectedRows === 1) {
    res.send({ update: "success" });
  }
  res.send({ update: "fail" });
});

router.get("/institution/:no", async (req, res) => {
  const no = req.params.no;
  let result = await userService.insTelService(no);
  res.send(result);
});

// 아이디 찾기
router.post("/user/find-id", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await userService.findUserIdByEmail(email);

    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// 비밀번호 찾기
router.post("/user/check-user", async (req, res) => {
  try {
    const { user_id, email } = req.body;

    const result = await userService.findUserByIdAndEmail(user_id, email);

    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// 비밀번호 변경
router.put("/userpw/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const target = req.body;

    const result = await userService.resetUserPassword(userId, target);

    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// 회원탈퇴 : user_id로 이메일 조회
router.post("/user/get-info", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.json({ retCode: false, message: "아이디 누락" });

  try {
    const user = await userService.getUserById(user_id);
    if (user) res.json({ retCode: true, email: user.email });
    else res.json({ retCode: false, message: "사용자를 찾을 수 없습니다." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ retCode: false, message: "조회 실패" });
  }
});

// 회원탈퇴
router.post("/withdraw", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.json({ retCode: false, message: "아이디 누락" });

  try {
    const result = await userService.withdrawUser(user_id);
    if (result.affectedRows > 0) res.json({ retCode: true });
    else res.json({ retCode: false, message: "탈퇴 처리 실패" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ retCode: false, message: "서버 오류" });
  }
});

module.exports = router;
