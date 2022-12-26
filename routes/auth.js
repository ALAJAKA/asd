const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const router = express.Router();

// sequelize의 Op연산자를 가져오기 위한 방법
const {Op} = require("sequelize");
const {User} = require("../models");
const {render} = require("ejs");

router.use(cookieParser());
const SECRET_KEY = `HangHae99`;
// 회원가입 페이지로 이동
router.get("/signup",(req,res)=>{
    res.render("signup",{title:"회원가입"})
});
// 회원가입 하기
router.post("/signup",async (req,res)=>{
    try {
        const {username, password, confirm, nickname} = req.body;
        // 정규 표현식 / 0~9 a~z A~Z 의 문자 외의 값이 들어오면 true로 처리
        const regExp = /[^0-9a-zA-Z]/g;
        // 닉네임 길이& 특수문자 에러 처리
        if (nickname.length < 3 || regExp.test(nickname)) {
            res.status(412).json({"errorMessage": "잘못된 형식의 닉네임입니다."});
            // res.write("<script>alert('잘못된 형식의 닉네임입니다.')</script>");
            return ;
        }
        // password길이 및 닉네임을 포함하는지 에러처리
        if (password.length < 4 || password.includes(nickname)) {
            res.status(412).json({"errorMessage": "패스워드 형식이 일치하지 않습니다."});
            return;
        }
        // 패스워드 일치하지 않음
        if (password !== confirm) {
            res.status(412).json({"errorMessage": "패스워드가 일치하지 않습니다."});
            return;
        }

        // id해당 id가 db에 있는지 조회
        const username1 = await User.findOne({
            where: {username: username}
        });
        // id가 이미 존재하면 중복 에러 처리
        if (username1 != null) {
            res.status(412).json({"errorMessage": "이미 존재하는 아이디 입니다"});
            return;
        }
        // 해당 닉네임이 존재하는지 확인 Op연산자 사용
        const usernick = await User.findOne({
            where: {
                nickname: {
                    [Op.eq]: nickname
                }
            }
        });
        // 해당 닉네임이 존재하면 중복 에러 처리
        if (usernick != null) {
            res.status(412).json({"errorMessage": "중복된 닉네임입니다."});
            return;
        }
        await User.create({
            username : username,
            nickname : nickname,
            password : password,
            likes : "",
        });
    }catch(err){
        res.status(400).json({"errorMessage":"요청한 데이터 형식이 올바르지 않습니다"});
        return ;
    }
    return res.redirect("/");
});
//로그인 하기
router.post("/login",async (req,res)=>{
    // 400에러 모르는거 처리를 위한
    try {
        // 데이터 받아오기
        const {username, password} = req.body;
        // 유저가 있는지 찾기
        const user = await User.findOne({
            where: {
                username,
            }
        });
        // 입력받은 패스워드와 db에 있는 유저의 패스워드 비교
        if (!user || user.password !== password) {
            res.status(400).json({"errorMessage": "아이디 또는 패스워드를 확인해주세요"});
            return;
        }
        // 토큰으로 넣을 데이터값
        const payload = {
            userId :user.userId,
            username : user.username,
            nickname : user.nickname
            };
        //토큰 만들기
        // jwt.sign (토큰에 넣을 정보, 토큰 키 , 옵션(시간제한)) --> http전송시 Application에는 존재하지만 만료되어서 없는 취급함
        const token = jwt.sign(payload,SECRET_KEY,{expiresIn: '1d'});
        //토큰 까는법
        // console.log("decodedValue",decodedValue)
        res.cookie("token",token);
        return res.json({token:token});
    }catch (e){
        console.log(e);
        res.status(400).json({error:"로그인에 실패하였습니다."});
        return ;
    }

});

router.get("/logout",(req,res)=>{
    res.clearCookie("token");
    res.redirect("/");
});

// const authMiddleware = require("../middleware/auth-middleware.js")
// router.get("/users/me",authMiddleware, async(req,res,next)=>{
//     res.json({
//         user:res.locals.user
//     })
// });


module.exports = router;