const express=require("express");
const dotenv=require("dotenv");
const mongoose=require("mongoose")
const morgan=require("morgan");
const path=require("path");
const ejsMate=require("ejs-mate"); // to use layout,partials,block etc
const connectDB=require("./config/db");
const passport=require("passport");
const expressLayouts = require('express-ejs-layouts');
const session=require("express-session")
const MongoStore=require("connect-mongo")
const methodOverride=require("method-override");

//Load config
dotenv.config({ path : './config/config.env' });

//passport config
require("./config/passport")(passport)

//Connect to mongo db
connectDB();


//instantiating Express and assigning app variable to it
const app=express();

//ejs and views
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set("views",path.join(__dirname,"views"));
app.set('layout','./layouts/boilerpate');

//session
const sessionConfig={
  secret:"Thisshouldbeabettersecret",
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
  },
  store: MongoStore.create({mongoUrl:process.env.MONGO_URI})
}
app.use(session(sessionConfig));

//passport middleware
app.use(passport.initialize())
app.use(passport.session())


//set global variable
app.use((req,res,next)=>{
  res.locals.loggedInUser=req.user || null;
  next();
})


//Request from client to server
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//To support put and delete requests
app.use(methodOverride('_method'));

//Logging
if(process.env.NODE_ENV==="development"){
  app.use(morgan('dev'));
}




//Static folder
app.use(express.static(path.join(__dirname,'public')));

const PORT=process.env.PORT || 4200;

//Routes
app.use("/",require("./routes/index"))
app.use("/auth",require("./routes/auth"))
app.use("/stories",require("./routes/stories"))

app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));