const userMapper = require("../database/mappers/user_mapper");
const bcrypt = require('bcrypt');

const createUser = async (userObj) => {
  const {
    role,
    user_name,
    user_id,
    user_pwd,
    user_email,
    tel,
    address,
    institution,
  } = userObj;

  const hashedPw = await bcrypt.hash(user_pwd, 10);

  let insertData = [
    role,
    user_name,
    user_id,
    hashedPw,
    user_email,
    tel,
    address,
    institution,
  ];
  let result = await userMapper.insertUser(insertData);
  return result;
};

const loginService = async (id, pw) => {
  let result = await userMapper.loginUser(id);

  if (result.length === 0) {
    return null;
  }

  const user = result;
  console.log(user);
  const isMatch = await bcrypt.compare(pw, user.user_pw);

  if (!isMatch) {
    return null;
  }

  return user;
};

const approvalAccess = async (insNo) => {
  let result = await userMapper.approval(insNo);
  return result;
};

const approvalByAdminAccess = async () => {
  let result = await userMapper.approvalByAdmin();
  return result;
};

const signAccess = async (userId) => {
  let result = await userMapper.access(userId);
  return result;
};

const signRefuseService = async (userId) => {
  let result = await userMapper.signX(userId);
  return result;
};

const insTelService = async (no) => {
  let result = await userMapper.insTel(no);
  return result;
};

// 아이디 찾기
const findUserIdByEmail = async (email) => {
  const result = await userMapper.findUserIdByEmail(email);

  return {
    retCode: !!result,
    user_id: result ? result.user_id : null,
    target: result || null,
    message: result ? "아이디 조회 성공" : "등록된 이메일이 없습니다.",
  };
};

// 비밀번호 찾기
const findUserByIdAndEmail = async (userId, email) => {
  const result = await userMapper.findUserByIdAndEmail(userId, email);

  return {
    status: !!result,
    target: result || null,
  };
};

// 비밀번호 변경
const resetUserPassword = async (userId, userObj) => {
  const result = await userMapper.updatePw(userId, userObj.user_pw);

  return {
    status: result.affectedRows > 0,
    target: {
      user_id: userId,
    },
  };
};

// DB에서 user_id로 이메일 조회
const getUserById = async (userId) => {
  return await userMapper.selectUserById(userId);
};

// DB에서 user_id로 탈퇴
const withdrawUser = async (userId) => {
  return await userMapper.withdrawUser(userId);
};

module.exports = {
  loginService,
  createUser,
  approvalAccess,
  approvalByAdminAccess,
  signAccess,
  signRefuseService,
  insTelService,
  findUserIdByEmail,
  findUserByIdAndEmail,
  resetUserPassword,
  getUserById,
  withdrawUser,
};
