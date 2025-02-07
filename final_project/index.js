const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const users = require('./router/auth_users.js').users;
const genl_routes = require('./router/general.js').general;

const app = express();

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)})
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (req.session.authorization)
{
    let token = req.session.authorization['accessToken'];

    jwt.verify(token, "access", (err, user) => {
        if (!err)
        {
            req.user = user;
            next();
        } else {
            return res.status(403).json({message: "User not authenticated"});
        }
    })
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
