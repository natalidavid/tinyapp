const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// body parser setup
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// cookie parser setup
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//generate 6 alphanumerical string to use for URL shortening
const generateRandomString = function() {
  let r = Math.random().toString(36).substring(6);
  return r;
};

// route handler
// add cookies to all templateVars since header shows up on all these pages
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// present form to the user
// templateVars that were missing before!
// Style objects on new lines: advice by mentor Kat
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});

// Edit buttons action
// Updates URL resource
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//POST request for deleting our entries
//Use wisely / reset the server afterwards
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  //redir back to the main page with My URLs
  res.redirect("/urls");
});

// POST handle for our login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // sets "username" value to the value we submit in the login form (in the _header)!
  res.redirect("/urls");
  //redirect to our main page
});

// POST handle for our logout action
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  //clears the cookie, thus logging user out
  res.redirect("/urls");
});


// GET endpoint, returns register_page template
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("register_page", templateVars);
});

// GET route handler
// This will take us to the full webiste page we're creating URL shortening for
app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  //redirects to original URL, eg lighthouselabs.ca
});

// GET request to the urls_show.ejs
// Page displays template with full web address, short web address
// Update: updates the long address only
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// Displays 404 message
app.get("*", (req, res) => {
  res.sendStatus(404);
});

// Displays the message when server is up
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});