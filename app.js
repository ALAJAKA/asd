const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const router = express.Router();
const authRouter = require("./routes/auth");
const postsRouter = require("./routes/board");
const commentRouter = require("./routes/comment");
const {User} = require("./models");
const {board} = require("./models");
const {Comment} = require("./models");
const {render} = require("ejs");

app.use("/",express.urlencoded({extended:false}),router);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// main pager
router.get("/",async (req,res)=>{
    res.render("index",{title:"메인페이지"});
});

app.use("/",authRouter);
app.use("/posts",postsRouter);
app.use("/comments",commentRouter);

app.listen(8080,(req,res)=>{
    console.log("서버 열림");
});


module.exports = app;