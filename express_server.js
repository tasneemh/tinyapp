const {emailExists, passwordMatching, getUserId, urlsForUser} = require('./helpers');
const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
//below code helps in using body-parser
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//below code tells express to use ejs as templating engine
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
app.get("/", (req, res)=>{
  if (req.session.user_id){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});
app.get("/urls.json", (req, res)=>{
  res.json(urlDatabase);
});
app.get("/hello", (req, res)=>{
  res.send("<html><body>Hello <b>World</b></body></html>");
});
app.get("/set", (req, res)=>{
  const a = 1;
  res.send(`a = ${a}`);
});
/*
the below code will not work as a is not defined
app.get("/fetch", (req, res)=>{
  res.send(`a = ${a}`);
});
*/
app.get("/urls", (req, res)=>{
 
  const user_id = req.session.user_id;
  const resultObj = urlsForUser(urlDatabase, user_id);
  const templateVars = {urls: resultObj, myUser: users[req.session.user_id]};
  console.log(req.session);
  console.log(users);
  res.render("urls_index", templateVars);
});
//Add a GET Route to Show the Form
app.get("/urls/new", (req, res)=>{
  if (req.session.user_id && users[req.session.user_id]){
    const templateVars = {myUser: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else{
    res.redirect("/login");
  }
});
//makes the edits to the url
app.get("/urls/:shortURL", (req, res)=>{
  const user_id = req.session.user_id;
  const urlUserId = urlDatabase[req.params.shortURL].userID;
  //const resultObj = urlsForUser(urlDatabase, user_id);
  if (user_id){
    if (user_id === urlUserId){
      const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, myUser: users[req.session.user_id]};
      res.render("urls_show", templateVars);
    } else {
      res.send("<html><body>You are not shortURL</body></html>");
      // res.redirect("/urls");
    }
  } else {
    res.send(`<html><body>You are not logged in!</body></html>`);
  }    
});
//redirects to the longURl website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//creating new  urls
app.post("/urls", (req, res)=>{
  const shortURL = generateRandomString(); //generating shortURL
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id}
  res.redirect(`/urls/${shortURL}`);
});
//register page
app.get("/register", (req, res)=>{
  console.log(req.session);
  //console.log(req.session.userId);
  const templateVars = {myUser: null};
  res.render("registration", templateVars);
});

//post for register page
app.post("/register", (req, res)=>{
  const id = req.body;
  console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(incomingPassword, 10);
    if (incomingEmail === "" || incomingPassword === ""){
      res.status(400);
      res.send("Your email/password is incorrect");
      return;
    }
  //we should check if email exists
    if (emailExists(users, incomingEmail)){
      console.log("email exists");
      res.status(400);
      res.send("Email already exists");
      // res.redirect("/register");
    }  else {
      //if we want to add the user to the users object
      const newId = generateRandomString();
      const newUser = {
        id: newId,
        email: incomingEmail,
        password: hashedPassword,
        //password: incomingPassword
      };
      users[newId] = newUser;
      console.log(users);
      req.session['user_id'] = newId;
      //req.session('user_id', newId);
      //console.log(res.cookie);
      res.redirect("/urls");
    }
});
//delete url
app.post("/urls/:shortURL/delete", (req, res)=>{
  // delete shortURL;
  const user_id = req.session.user_id;
  const urlUserId = urlDatabase[req.params.shortURL].userID;
  if (user_id === urlUserId){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("<html><body>You are not authorized to do it</body></html>");
  }
});
app.post("/urls/:id", (req, res)=>{
  //const newLongURL = req.body.newLongURL;
  //const shortURL = req.params.id;
  //urlDatabase[shortURL] = newLongURL;
  const templateVars = {shortURL: req.params.id, longURL: 
  urlDatabase[req.params.id].longURL,  myUser: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});
//get login page
app.get("/login", (req, res)=>{
  //const isLoggedIn = true;
  const templateVars = {myUser: null};
  res.render("login", templateVars);
});
//post login page
app.post("/login", (req, res)=>{
  //we get req.body object
  console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  //const newId = generateRandomString();
    if (emailExists(users, incomingEmail)){
      if (passwordMatching(users, incomingPassword)){
        const newId = getUserId(users, incomingEmail);
        req.session['user_id'] = newId;
        res.redirect("/urls");
      } else {
        res.status(403);
        res.send("Password does not match with our records");
        //res.redirect("/login");
      }
    } else {
      res.status(403);
      res.send("Email does not match with our records");
      //res.redirect("/login");
    }
});
app.post("/logout", (req, res)=>{
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, ()=>{
  console.log(`Example listening on port ${PORT}`);
});
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};
/*
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
const getUserByEmail = function(userDatabase, email){
  for (let user in userDatabase){
      if (userDatabase[user].email === email){
      return user;
    } 
  } 
};

*/