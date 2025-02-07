const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    if (username === "")
    {
        return false;
    }
    let existingUser = users.filter((user) => (user.username === username));
    return existingUser.length == 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)})
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const password = req.body.password;
  const username = req.body.username;

  // Check for missing password
  if (!password || !username)
  {
    return res.status(400).json({message: "Error logging in, credentials invalid"})
  }

  if (authenticatedUser(username, password))
  {
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });
    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({message: "Login Successful"})
  }

  return res.status(401).json({message: "Invalid login credentials"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.authorization.username;
  const review = req.query.review;
  const isbn = req.params.isbn;
  if (!username || !review)
  {
    return res.status(400).json({message: "No username or review found"});
  }

  if (!books[isbn])
  {
    return res.status(404).json({message: "Book with isbn: " + isbn + " not found"});
  }

  console.log(books[isbn]["reviews"])
  books[isbn].reviews[username] = review
  return res.status(200).json({message: "Review updated"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    if (!books[isbn])
    {
        return res.status(404).json({message: "Invalid isbn"});
    }

    if (!username)
    {
        return res.status(404).json({message: "Invalid request received"});
    }
    
    if(!books[isbn]["reviews"][username])
    {
        return res.status(404).json({message: "User has no reviews"});
    }
    delete books[isbn]["reviews"][username];
    return res.status(200).json({message: "Successfully removed review"});
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
