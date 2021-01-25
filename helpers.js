const bcrypt = require('bcrypt');

//callback to check if user exists
const emailExists = function(userDatabase, email) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};
//to check if password matches
const passwordMatching = function(userDatabase, incomingPassword) {
  for (let user in userDatabase) {
    if (bcrypt.compareSync(incomingPassword, userDatabase[user].password)) {
      return true;
    }
  }
  return false;
};
//get obj cotaining userURLS
const urlsForUser = (urlDatabase, userId) => {
  let userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};
//get userId by email
const getUserByEmail = function(userDatabase, email) {
  for (let userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      return userID;
    }
  }
  return undefined;
};
//to create shortURL and userId
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

module.exports = {emailExists, passwordMatching, urlsForUser, getUserByEmail, generateRandomString};