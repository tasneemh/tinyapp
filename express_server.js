const {
  emailExists,
  passwordMatching,
  getUserByEmail,
  urlsForUser,
  generateRandomString} = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
//below code helps in using body-parser
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

//below code tells express to use ejs as templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//redirects to /urls if user is logged in else redirects to /login
app.get("/", (req, res) => {
  //if user is logged in
  if (req.session.cookieUserId) {
    res.redirect("/urls");
  } else {
    //if user is not logged in
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  //console.log(req.session.cookieUserId);
  //if user is logged in
  if (req.session.cookieUserId){
    const cookieUserId = req.session.cookieUserId;
    const resultObj = urlsForUser(urlDatabase, cookieUserId);
    const templateVars = { urls: resultObj, myUser: users[req.session.cookieUserId] };
    res.render("urls_index", templateVars);
  } else {
    //if user is not logged in
    res.send("<html><body>You are not logged in to access this page</body></html>");
  }
});

//Add a GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  //if user is logged in
  if (req.session.cookieUserId && users[req.session.cookieUserId]) {
    const templateVars = { myUser: users[req.session.cookieUserId] };
    res.render("urls_new", templateVars);
  } else {
    //if user is not logged in
    res.redirect("/login");
  }
});

//updating the url
app.get("/urls/:shortURL", (req, res) => {
  const cookieUserId = req.session.cookieUserId;
  const urlUserId = urlDatabase[req.params.shortURL].userID;
  //if user is logged in
  if (cookieUserId) {
    if (cookieUserId === urlUserId) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        myUser: users[req.session.cookieUserId],
      };
      res.render("urls_show", templateVars);
    } else {
      res.send("<html><body>This is not your shortURL</body></html>");
    }
    //if user is not logged in
  } else {
    res.send(`<html><body>You are not logged in!</body></html>`);
  }
});

//redirects to the longURl website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log(shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//creating new  urls
app.post("/urls", (req, res) => {
  //user logged in
  if (req.session.cookieUserId){
  const shortURL = generateRandomString(); //generating shortURL
  urlDatabase[shortURL] = {
  longURL: req.body.longURL,
  userID: req.session.cookieUserId,
  };
  res.redirect(`/urls/${shortURL}`);
  } else {
    //user not logged in
    res.send("<html><body>You must be logged in to do that</body></html>");
  }
  
});

//register page
app.get("/register", (req, res) => {
  //console.log(req.session);
  const templateVars = { myUser: null };
  res.render("registration", templateVars);
});

//post for register page
app.post("/register", (req, res) => {
  //console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(incomingPassword, 10);
  if (incomingEmail === "" || incomingPassword === "") {
    res.status(400);
    res.send("Your email/password is incorrect");
    return;
  }
  //we should check if email exists
  if (emailExists(users, incomingEmail)) {
    console.log("email exists");
    res.status(400);
    res.send("Email already exists");
  } else {
    //if we want to add the user to the users object
    const newId = generateRandomString();
    const newUser = {
      id: newId,
      email: incomingEmail,
      password: hashedPassword,
    };
    users[newId] = newUser;
    console.log(users);
    req.session["cookieUserId"] = newId;
    res.redirect("/urls");
  }
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieUserId = req.session.cookieUserId;
  const urlUserId = urlDatabase[req.params.shortURL].userID;
  if (cookieUserId === urlUserId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("<html><body>You are not authorized to do it</body></html>");
  }
});

//making edits to the shortURL
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.newLongURL;
  //newLongURL is database
  urlDatabase[req.params.id].longURL = newLongURL;
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    myUser: users[req.session.cookieUserId],
  };
  res.render("urls_show", templateVars);
});

//get login page
app.get("/login", (req, res) => {
  const templateVars = { myUser: null };
  res.render("login", templateVars);
});

//post login page
app.post("/login", (req, res) => {
  //we get req.body object
  //console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  if (emailExists(users, incomingEmail)) {
    if (passwordMatching(users, incomingPassword)) {
      const newId = getUserByEmail(users, incomingEmail);
      req.session["cookieUserId"] = newId;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("Your Password does not match with our records");
    }
  } else {
    //error when user enters incorrect email address
    res.status(403);
    res.send(
      "Email does not match with our records. Please enter correct email address"
    );
  }
});

//logout page
app.post("/logout", (req, res) => {
  //setting the cookies
  req.session = null;
  //res.clearCookie.cookieUserId; 
  res.redirect("/urls");
});

//server listening to http requests via port
app.listen(PORT, () => {
  console.log(`Example listening on port ${PORT}`);
});
