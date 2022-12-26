const express = require("express");
const jwt = require("jsonwebtoken");

const {Op} = require("sequelize");
const {User} = require("../models");
const {Board} = require("../models");
const {Comment} = require("../models");

const router = express.Router();

const authMiddleware = require("../middleware/auth-mware.js");
// 댓글 조회
router.get("/:postId",authMiddleware,async (req,res)=>{
    const {postId} = req.params;
    try{
        const comments = await Comment.findAll({
            where:{postId:postId}
        })
        res.json({comments:comments})

    }catch(e){
        res.status(400).json({errorMessage:"댓글 조회 실패"});
    }
});
// 댓글 생성
router.post("/:postId",authMiddleware,async (req,res)=>{
    const {postId} = req.params;
    const {comment} = req.body;
    const {token} = req.cookies;
    const {userId,nickname} = jwt.decode(token);
    try{
        await Comment.create({
            postId:postId,
            comment:comment,
            userId:userId,
            nickname:nickname
        });
        res.json({msg:"댓글을 생성하였습니다."})
    }catch (e){
        res.status(400).json({errorMessage:"댓글 작성에 실패하였습니다"});
        return ;
    }
});
// 댓글 수정
router.put("/:commentId",authMiddleware,async(req,res)=>{
    const {commentId} = req.params;
    const {comment} = req.body
    console.log(commentId)
    console.log(comment)
    try{
        await Comment.update({
            comment:comment
        },{
            where:{commentId:commentId}
        });
        res.json({msg:"댓글 수정 완료"});
    }catch (e){
        console.log(e);
        res.status(400).json({errorMessage:"나도 에러 모름 이제"});
    }
})
// 댓글 삭제
router.delete("/:commentId",authMiddleware,async(req,res)=>{
    try{
        const {commentId} = req.params;
        await Comment.destroy({
            where:{commentId:commentId}
        })
        res.json({msg:"삭제완료"});
    }catch(e){
        res.status(400).json({errorMessage:"댓글 삭제에 실패하였습니다."});
    }
})


module.exports = router;