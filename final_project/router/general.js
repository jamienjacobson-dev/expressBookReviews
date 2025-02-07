const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username)
  {
    return res.status(422).json({message:"No username provided"})
  }
  if (username === "")
  {
    return res.status(422).json({message:"Username cannot be empty"})
  }
  if (!isValid(username))
  {
    return res.status(415).json({message:"Username \""+username+"\" already exists. please choose another."})
  }

  if (!password)
  {
    return res.status(422).json({message:"Please provide a password"});
  }
  if (password === "")
  {
    return res.status(422).json({message:"Password cannot be empty"});

  }
  users.push({"username":username, "password":password})
  return res.status(200).send({message: username + " was successfully registered"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  new Promise((resolve, reject) => {
    resolve(books);
  }).then((books) => {
    return res.status(200).send(JSON.stringify(books,null,4));
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn+""];
  
  
  new Promise((resolve, reject) =>{
    if (!book)
    {
        reject(new Error(`ISBN: ${isbn} not found`));
    //return
    } else {
        resolve(book);
    }
  }).then((book) =>{ 
    return res.status(200).send(JSON.stringify(book));
    }).catch((error) => {
        return res.status(404).json({message: error.message})});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  let keys = Object.keys(books);
  let authorsBooks = [];

  new Promise((resolve, reject) =>{
      keys.forEach(key => {
          if (books[key].author === author)
          {
            authorsBooks = [...authorsBooks, books[key]]
          }
      });
    if (authorsBooks.length > 0)
    {
        resolve(authorsBooks);
    } else
    {
        reject(new Error( "Author: " + author + " not found."))
    }
  }).then((authorList) =>{
        return res.status(200).send(JSON.stringify(authorList));
  }).catch((error) =>{
        return res.status(404).json({message: error.message});
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.trim();

    let keys = Object.keys(books);
    let titles = [];
    new Promise((resolve, reject) =>{
        keys.forEach(key => {
              if (books[key].title === title)
              {
                  titles = [...titles, books[key]]
              }
          });
          console.log(titles);
        if (titles.length > 0)
        {
          resolve(titles);
        } else
        {
          reject(new Error(title + " not found."));
        }
    }).then((titleList) =>{
        return res.status(200).send(JSON.stringify(titleList));
  }).catch((error) =>{
        return res.status(404).json({message: error.message});
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  return res.status(200).send(JSON.stringify(books[isbn]["reviews"]));
});

module.exports.general = public_users;
