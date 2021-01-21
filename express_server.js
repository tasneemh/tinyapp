const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
//below code helps in using body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//below code tells express to use ejs as templating engine
app.set("view engine", "ejs");
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.send("Hello!");
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
  const templateVars = {urls: urlDatabase, myUser: users[req.cookies.user_id]};
  console.log(req.cookies);
  console.log(users);
  res.render("urls_index", templateVars);
});
//Add a GET Route to Show the Form
app.get("/urls/new", (req, res)=>{
  const templateVars = {myUser: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res)=>{
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], myUser: users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
  // console.log(req.params.shortURL); //shortURL: req.params.shortURL
  // console.log(urlDatabase[req.params.shortURL]); // longURL: urlDatabase[shortURL]
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post("/urls", (req, res)=>{
  // console.log("req.body:",req.body);
  // console.log(req.body.longURL);
  // res.send("Ok");
  const string = generateRandomString();
  // console.log(string);
  urlDatabase[string] = req.body.longURL
  res.redirect(`/urls/${string}`);
  // console.log(urlDatabase);
});
//register page
app.get("/register", (req, res)=>{
  const templateVars = {myUser: null};
  res.render("registration", templateVars);
});

//post for register page
app.post("/register", (req, res)=>{
  const id = req.body;
  console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
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
        password: incomingPassword
      };
      users[newId] = newUser;
      console.log(users);
      res.cookie('user_id', newId);
      console.log(res.cookie);
      res.redirect("/urls");
    }
});
//delete url
app.post("/urls/:shortURL/delete", (req, res)=>{
  // delete shortURL;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res)=>{
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newLongURL;
  const templateVars = {shortURL: req.params.id, longURL: 
  urlDatabase[req.params.id],  myUser: users[req.cookies.user_id]};
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
        res.cookie('user_id', newId);
        res.redirect("/urls");
      } else {
        res.status(403);
        res.send("Password does not match with our records");
      }
    } else {
      res.status(403);
      res.send("Email does not match with our records");
    }
});
app.post("/logout", (req, res)=>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.listen(PORT, ()=>{
  console.log(`Example listening on port ${PORT}`);
});
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};
//callback to check if user exists
const emailExists = function(userDatabase, email){
  for (let user in userDatabase){
      if (userDatabase[user].email === email){
      return true;
    } 
  } 
  return false;
};
const passwordMatching = function(userDatabase, password){
  for (let user in userDatabase){
    if (userDatabase[user].password === password){
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

/*
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
*/

// console.log(emailExists(users, "user@example.com"));