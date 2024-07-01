require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
// const { default: mongoose } = require("mongoose");

const app = express();

const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.DB_URI,{useNewUrlParser:true})
// app.use(bodyParser.urlencoded({ extended: true }));

const db = mongoose.connection;
db.on('error', err => console.log(err));
db.once('open',()=>console.log("connection open!"))

// middlewares
app.use(express.urlencoded({extented: false}));
app.use(express.json());

app.use(session({
    secret:'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res,next) =>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(express.static('uploads'));

app.set('view engine','ejs');

//router perfix

app.use("",require("./routes/route"))

app.listen(PORT, () => {
    console.log(`Server is running on port `);
})