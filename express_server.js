const express = require('express');
const app = express();
const PORT = 8080;
//below code helps in using body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//below code tells express to use ejs as templating engine
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
//Add a GET Route to Show the Form
app.get("/urls/new", (req, res)=>{
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res)=>{
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
  // console.log(req.params.shortURL); //shortURL: req.params.shortURL
  // console.log(urlDatabase[req.params.shortURL]); // longURL: urlDatabase[shortURL]
});
app.post("/urls", (req, res)=>{
  console.log(req.body);
  res.send("Ok");
});
app.listen(PORT, ()=>{
  console.log(`Example listening on port ${PORT}`);
});
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};
