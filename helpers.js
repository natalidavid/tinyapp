//functions to use inside the express_server.js
const bcrypt = require("bcryptjs");

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk"
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
  console.log(users);
  for (let user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].hashedPassword)) {
      return true;
    }
  }
  return false;
};

// returns URLs where the userID === id of the currently logged in user
const urlsForUser = function(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
  // sending back urls if the id matches
};


module.exports = { generateRandomString, getUserByEmail, getPasswordCheck, urlsForUser, urlDatabase, users };