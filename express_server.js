const { generateRandomString, getUserByEmail, getPasswordCheck, urlsForUser, urlDatabase, users } = require("./helper")

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

// cookie session setup
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'cookie',
  keys: ['key1', 'key2']
}))

// password hashing magic
const bcrypt = require("bcryptjs");


// main index page of URLs
// add cookies to all templateVars since header shows up on all these pages
app.get("/urls", (req, res) => {
// needs to be urls unique for the user
console.log(req.session.user_id);
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);

});

// present form to the user
// templateVars that were missing before!
// Style objects on new lines: advice by mentor Kat
app.get("/urls/new", (req, res) => {

  if (req.session.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: req.session.user_id
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls`);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log("shortURL", shortURL);
  // console.log("req", req.body);
  urlDatabase[shortURL].longURL = req.body.longURL;
  //get longURL value from the object
  res.redirect(`/urls/`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("urldatabase", urlDatabase[shortURL].longURL);
  const longURL = urlDatabase[shortURL].longURL;
  if (req.session.user_id) {
    let templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      user: users[req.session.user_id]
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
    // res.cookie("user_id", mailCheck);
    req.session.user_id = mailCheck;
    res.redirect("/urls");
  } else {
    const templateVars = {
      error: "Something's wrong!"
    };
    res.status(403).render('404', templateVars);
  }
});

// POST handle for our logout action
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  //clears the cookie, thus logging user out
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check for empty fields and duplicate emails

  if (!email || !password) {
    const templateVars = {
      error: "Something's wrong!"
    };
    res.status(400).render('404', templateVars);

  } else if (getUserByEmail(email, users)) {
    const templateVars = {
      error: "Something's wrong!"
    };
    res.status(400).render('404', templateVars);

  } else {
    const id = generateRandomString();
    // create user object
    const user = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    };

    console.log(user);
    users[id] = user;
    // res.cookie("user_id", user.id);
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// GET endpoint, returns register_page template
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session.user_id
  };
  res.render("register_page", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id
  };
  res.render("login_page", templateVars);
});

// GET route handler
// This will take us to the full webiste page we're creating URL shortening for
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  //redirects to original URL, eg lighthouselabs.ca
});

// GET request to the urls_show.ejs
// Page displays template with full web address, short web address
// Update: updates the long address only
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id) {
    delete urlDatabase[shortURL];
  } else {
    const templateVars = {
      error: "Action not allowed!"
    };
    res.status(400).render('404', templateVars);
  }
  //redir back to the main page with My URLs
  res.redirect("/urls");
});

// Displays 404 message
app.get("*", (req, res) => {
  const templateVars = {
    error: "404 not found!"
  };
  res.render("404", templateVars);
});

// Displays the message when server is up
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
