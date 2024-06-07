const express = require("express")
const path = require("path")
require("dotenv").config()
const nocache = require('nocache')
//session
const session = require('express-session')
//express ejs layouts
const expressLayouts=require('express-ejs-layouts')
const {v4: uuidv4} = require('uuid')
//flash message
const flash = require('connect-flash')

const app = express()

const adminRoutes = require('./routes/adminRoutes')
const userRoutes = require('./routes/userRoutes')

const connectDB = require("./config/connection")


//port setting
const port = process.env.PORT || 3000

//mongodb connection
connectDB();

//setting view engine
app.set('view engine','ejs')
app.use(flash())

//public static files
app.use('/public',express.static(path.join(__dirname,'public')))
app.use('/uploads',express.static(path.join(__dirname,'uploads')))


//url encoded data
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// middlewares

app.use(nocache())
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false
}))

// layouts
app.use(expressLayouts);
app.set('layout','./layouts/layout')


app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

//routes
app.use('/admin',adminRoutes)
app.use('/user',userRoutes)

//first route to render
app.get("/",(req,res)=>{
    try {
        res.redirect('/user')
    } catch (error) {
        console.log(`error from main route ${error}`)
    }
    
})

//404 page render
app.use("*",(req,res)=>{
    res.render('pageNotFound',{title:"Page not found"})
})



//server listening
app.listen(port,(err)=>{
    if(err){
        console.log("Error while listening port")
    }else{
        console.log(`Server listening to  http://localhost:${port}`)
    }
})