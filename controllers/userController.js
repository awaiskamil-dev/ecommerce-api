const getAllUsers = async (req, res) => {
  res.send('Getting all users');
};

const getSingleUser = async (req, res) => {
  res.send('Getting a single user');
};

const showCurrentUser = async (req, res) => {
  res.send('Showing current user');
};

const updateUser = async (req, res) => {
  res.send('Updating user');
};

const updateUserPassword = async (req, res) => {
  res.send('Updating user password');
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
};