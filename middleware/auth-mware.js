const jwt = require("jsonwebtoken");
const {User} = require("../models");
const SECRET_KEY = `HangHae99`;

module.exports = async(req,res,next)=>{
    const {token} = req.cookies;
    if(token === undefined){
        res.clearCookie("token");
        res.redirect("/");
        res.status(400).json({
            errorMassage : "로그인 후 사용이 가능하다."
        });
        return ;
    }
    try{
        const {username} = jwt.verify(token,SECRET_KEY);
        await User.findOne(
            {
                where: {username: username}
            }
        )

    }catch(e){
        res.clearCookie("token");
        res.redirect("/");
        res.status(400).json({
            errorMessage : "로그인 후 사용 가능하다."
        })
        return ;
    }
    next();
}