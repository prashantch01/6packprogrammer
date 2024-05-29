const http = require('http');
const fs = require("fs");
const express = require('express');
const path = require('path');
const { default: mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');



const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");


const users = [];

mongoose.connect("mongodb://127.0.0.1:27017/testdb6").then(res => {
    console.log("connected");
}).catch(err => {
    console.log(err);
})

const userSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String,
})


const User = mongoose.model("User", userSchema);


const isAuthencated = async (req, res , next) => {
    const { token } = req.cookies;

    if (token) {
        const decode = jwt.verify(token , "secret");
        req.user = await User.findById(decode._id)
        next();
    }
    else {
        res.redirect("/login");
    }
}

app.get("/new" , isAuthencated , (req , res)=>{
    console.log(req.user);
    res.render("logout.ejs" , {name : req.user.name});
})




app.get("/loginpage",  (req, res) => {

    // res.cookie("token", "iamin");
    // let { token } = req.cookies;
    // if (token) {
    //     res.render("logout.ejs");
    // }
    // else {
    //     res.render("login.ejs");
    // }
    res.render("login.ejs");

})

app.get("/login" , (req , res)=>{
    res.send("done")
})


app.post("/login",async (req, res) => {

    let { email , password } = req.body;

    let user = await User.findOne({email});
    if(!user)
        {
            // return console.log("Register first");
            res.redirect("/register");
        }

    //  user = await User.create({
        
    //     email:email,
    //     password : password,
        
    //   })
    
    //   let token = jwt.sign({_id:user._id} , "secret");
    // //   console.log(token);

    // res.cookie("token", token, {
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 60 * 1000),
    // });
    // res.redirect("/logout")

    let isMatch = await bcrypt.compare(password , user.password);

    if(!isMatch)
        {
            return res.redirect("/login");
        }



        let token = jwt.sign({_id:user._id} , "secret");
    //   console.log(token);

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/logout")
       
})

app.get("/register" , (req , res)=>{
 
    res.render("register.ejs");
})


app.post("/register" ,  async (req , res)=>{
    let {name , email , password} = req.body;

    let hashedpassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({email});

    let newuser = await User.create({
        name:name, 
        email : email,
        password:hashedpassword,
    })


    let token = jwt.sign({_id:user._id} , "secret");
    //   console.log(token);

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/logout")
    

})
app.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    // res.redirect("/loginpage")
    // res.send("logout");
    res.render("logout.ejs");
})


app.listen(5000, (req, res) => {
    console.log("listening at port 5000");
})