const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// morgan middleware
const morgan = require('morgan');
app.use(morgan('dev'));

// body parser setup
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// cookie parser setup
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// Old urlDatabase object:
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
};

//generate 6 alphanumerical string to use for URL shortening
const generateRandomString = function() {
  let r = Math.random().toString(36).substring(6);
  return r;
};

//function that checks if emails were already in use
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
      //returns entire object instread of true value (as per mentor Gary)
    }
  }
};

//check if the password matches the user/email
const getPasswordCheck = function(email, password, users) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return true;
    }
  }
};

// returns URLs where the userID === id of the currently logged in user
const urlsForUser = function(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    console.log('urls', urlDatabase[shortURL]);
    if (id === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
  // sending back urls if the id matches
};

// main index page of URLs
// add cookies to all templateVars since header shows up on all these pages
app.get("/urls", (req, res) => {
// needs to be urls unique for the user
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    user: req.cookies.user_id
  };
  res.render("urls_index", templateVars);

});

// present form to the user
// templateVars that were missing before!
// Style objects on new lines: advice by mentor Kat
app.get("/urls/new", (req, res) => {

  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: req.cookies.user_id
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls`);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(`/urls/${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log("req.params.id", req.params.shortURL);
  // console.log("req.params", req.params);
  // console.log("urlDatabase[shortURL]", urlDatabase[shortURL]);
  const longURL = urlDatabase[shortURL]['longURL'];
  if (users[req.cookies.user_id]) {
    let templateVars = {
      shortURL,
      longURL,
      user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

// POST handle for our login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const mailCheck = getUserByEmail(email, users);
  const passCheck = getPasswordCheck(email, password, users);

  // evaluate: if email exists upon login
  // check if the password matches
  if (passCheck && mailCheck) {
    res.cookie("user_id", mailCheck);
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

// POST handle for our logout action
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  //console.log("user_id", req.body.user_id);
  //clears the cookie, thus logging user out
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check for empty fields and duplicate emails

  if (!email || !password) {
    res.sendStatus(400);
  } else if (getUserByEmail(email, users)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    // create user object
    const user = {
      id,
      email,
      password
    };
    users[id] = user;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
});

// GET endpoint, returns register_page template
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id
  };
  res.render("register_page", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id
  };
  res.render("login_page", templateVars);
});

// GET route handler
// This will take us to the full webiste page we're creating URL shortening for
app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  //redirects to original URL, eg lighthouselabs.ca
});

// GET request to the urls_show.ejs
// Page displays template with full web address, short web address
// Update: updates the long address only
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies.user_id) {
    delete urlDatabase[shortURL];
  } else {
    res.status(400).send("Action not allowed!");
  }
  //redir back to the main page with My URLs
  res.redirect("/urls");
});

// Displays 404 message
app.get("*", (req, res) => {
  res.sendStatus(404);
  res.redirect("/urls");
});

// Displays the message when server is up
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
