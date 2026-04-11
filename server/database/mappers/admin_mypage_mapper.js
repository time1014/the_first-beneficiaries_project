const adminMyPage = (rows) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const row = rows[0];

  return {
    user_no: row.user_no,
    user_id: row.user_id,
    user_name: row.user_name,
    tel: row.tel,
    email: row.email,
    address: row.address,
    institution_name: row.institution_name,
    created_at: row.created_at,
  };
};

module.exports = {
  adminMyPage,
};
