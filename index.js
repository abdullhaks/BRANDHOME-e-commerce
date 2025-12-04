
const dotenv = require("dotenv");
dotenv.config();
const { MongoStore } = require('connect-mongo');


//---------------------------------

const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

//---------------------------------

const express = require("express");   
const app = express(); 
app.set("trust proxy", 1);

const config = require("./config/config");  



//---------------------------------

const session = require("express-session");
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    ttl: 14 * 24 * 60 * 60, // optional: 14 days
  }),
  cookie: {
    maxAge: 2592000,
    secure: false,          // important for Render HTTP
    httpOnly: true,
    sameSite: "lax"
  }
}));


const nocache = require('nocache');

app.use(nocache());

//----------------------------------- 

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());


//-----------------------------------

app.set ("view engine", "ejs"); 
app.set ("views","./views");

//-------------------------------------

const fs = require('fs');

//-------------------------------------

const path = require('path');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname + '/public'));

app.use('/static',  express.static(path.join(__dirname,'public')));
app.use('/sheets',  express.static(path.join(__dirname,'public/sheets'))); 
app.use('/images',  express.static(path.join(__dirname,'public/images'))); 
app.use('/fonts',  express.static(path.join(__dirname,'public/fonts')));

//----------------------------------

const userRoute = require("./routes/userRoutes");
app.use ("/",userRoute);

//----------------------------------

const adminRoute = require("./routes/adminRoutes"); 
app.use ("/admin",adminRoute)


app.get('/checking', (req, res) => {
    res.send("Server is working fine");
});

//-----------------------------------

// const productRoute = require("./routes/productRoutes");   
// app.use ("/product",productRoute);

//-----------------------------------
const portNo = process.env.PORT_NO;
app.listen(portNo,function(){
    console.log("server is running on port number 7000 http://localhost:7000");
});

//----------------------------------