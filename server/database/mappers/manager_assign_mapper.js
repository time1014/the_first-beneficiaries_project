const approvedManagerList = (rows) => {
  return rows.map((row) => ({
    user_no: row.user_no,
    user_id: row.user_id,
    name: row.user_name,
  }));
};

module.exports = {
  approvedManagerList,
};
