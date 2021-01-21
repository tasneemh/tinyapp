const bcrypt = require('bcrypt');

//callback to check if user exists
const emailExists = function(userDatabase, email){
  for (let user in userDatabase){
      if (userDatabase[user].email === email){
      return true;
    } 
  } 
  return false;
};
const passwordMatching = function(userDatabase, incomingPassword){
  for (let user in userDatabase){
    if(bcrypt.compareSync(incomingPassword, userDatabase[user].password)){
      return true;
    }
  }
  return false;
};
const getUserId = function(userDatabase, email){
  for (let user in userDatabase){
      if (userDatabase[user].email === email){
      return user;
    } 
  } 
  return undefined;
};

const urlsForUser = (urlDatabase, userId) => {
  let userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const getUserByEmail = function(email, userDatabase){
  for (let user in userDatabase){
      if (userDatabase[user].email === email){
      return user;
    } 
  } 
  return undefined;
};

module.exports = {emailExists, passwordMatching, getUserId, urlsForUser};