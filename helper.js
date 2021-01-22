//functions to use inside the express_server.js


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

module.exports = { generateRandomString, getUserByEmail, getPasswordCheck, urlsForUser};