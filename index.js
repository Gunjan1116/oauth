const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStatergy = require("passport-google-oauth20").Strategy;
const ejs = require("ejs");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStatergy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://localhost:5000/auth/google/callback",
},
    function (accessToken, refreshToken, profile, cb) {
        //we can save by mongoose query
        cb(null, profile);
    }
)
);

passport.serializeUser(function (user, cb) {
    cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
    cb(null, obj)
})

app.use(express.static(path.join(__dirname, "public")));


app.get("/login", (req, res) => {
    res.render(path.join(__dirname, "login.ejs"));
})

app.get("/dashboard",(req,res)=>{
    if(req.isAuthenticated()){
        res.render(path.join(__dirname,"dashboard.ejs"),{
            user:req.user
        });
        
    }else{
        res.redirect("/login");
    }
})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/login"}),async(req,res)=>{
    res.redirect("/dashboard");
})

app.get('/logout', function(req, res){
    req.logOut((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/login");
        }
    })
  })



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)

})