const express = require("express");
const jwt = require("jsonwebtoken");

const {Op} = require("sequelize");
const {User} = require("../models");
const {Board} = require("../models")

const router = express.Router();

// 미들웨어
const authMiddleware = require("../middleware/auth-mware.js");
// 게시글 조회
router.get("/",authMiddleware,async (req,res)=>{
    try{
        // 보드테이블 전체 데이터 조회
        const boards = await Board.findAll({
        });
        // board.ejs로 랜더링 던져줄 데이터 title board
        res.render("board",{title:"게시판입니다.",board:boards});
    }catch(e){
     //    에러 발생시 아래 메시지 표시
     res.status(400).json({errorMessage:"게시글 조회에 실패하였습니다."});
    }
});
// 게시글 작성
router.post("/",authMiddleware,async(req,res)=>{
    const {title,content} = req.body;
    const {token} = req.cookies;
    const {userId,nickname} = jwt.decode(token);
    // 제목 길이가 0일때 에러처리
    if(title.length===0){
        res.status(412).json({errorMessage:"게시글 제목의 형식이 일치하지 않습니다"});
        return ;
    }
    // 내용물 길이가 0일때 에러처리
    if(content.length===0){
        res.status(412).json({errorMessage:"게시글 내용의 형식이 일치하지 않습니다"});
        return ;
    }

    try{
        // 보드테이블에 데이터 삽입
        const result = await Board.create({
            userId : userId,
            nickname:nickname,
            title:title,
            content:content,
        });
        res.status(201).json({msg:"게시글 작성 완료"});
        return ;
    }catch (e){
        res.status(400).json({errorMessage:"게시글 작성에 실패하였습니다."});
        return ;
    }
});
// 게시글 상세조회
router.get("/:postId",authMiddleware,async(req,res)=>{
    const {postId} = req.params;
    try{
        // 보드테이블 조회
        const board = await Board.findOne({
            where:{postId}
        });
        // content.ejs 로 넘김
        return res.render("content",{title:"상세보기입니다.",
            postId:board.postId,
            userId:board.userId,
            nickname:board.nickname,
            title2:board.title,
            content:board.content,
            createdAt:board.createdAt,
            updatedAt:board.updatedAt,
            likes:board.likes
        });
    }catch(e){
        res.status(400).json({errorMessage:"게시글 조회에 실패하였습니다."})
    }

});
// 게시글 삭제
router.delete("/:postId",authMiddleware,async (req,res)=>{
    try{
        const {postId} = req.params;
        // postId를 이욯해서 데이터 삭제
        await Board.destroy({
            where:{postId:postId}
        })
        res.json({msg:"삭제완료"});
    }catch(e){
        res.status(400).json({errorMessage:"게시글 삭제에 실패하였습니다."});
    }
});
// 게시글 수정
router.put("/:postId",authMiddleware,async (req,res)=>{
    try{
        const {postId} = req.params;
        const {title,content} = req.body;
        // Board데이터 업데이트 title,content 데이터를 업데이트함 -> postId를 기준으로 가져온 정보에서
        await Board.update({
            title:title,
            content:content
        },{
            where:{postId:postId}
        });
        res.status(200).json({msg:"게시글 수정 완료"});
    }catch(e){
        res.status(400).json({errorMessage:"게시글 수정에 실패하였습니다"});
    }
})
// 좋아요
router.put("/:postId/like",authMiddleware,async (req,res)=>{
    const {postId} = req.params;
    const {token} = req.cookies;
    // 쿠키에서 가져온 데이터 풀어줌
    const {userId} = jwt.decode(token);
    try{
        // User테이블를 현재 로그인 아이디로 조회
        const user = await User.findOne({
            where:{userId:userId}
        })
        // board테이블을 현제 게시글 id로 조회
        const post = await Board.findOne({
           where:{postId:postId}
        });

        // user에 라이크가 하나도 없을 때 라이크를 추가해주고
        if(user.likes ===null|| user.likes ===""){
            await User.update({
                likes : postId},
            {where:{
                    userId:userId
                }
            });
        }
        // 유저 라이크에 데이터가 있을때
        if(user.likes !== null ){
            const li = user.likes.split(" ");
            let a =0;
            let s ="";
            if(li.includes(postId)){
                for(let i=0; i<li.length; i++){
                    if(li[i]!=postId){
                        s = s+" "+li[i];
                    }
                }
                // board의 likes 갯수 증가
                s = s.trim();
                await Board.update({
                    likes : post.likes-1},{
                        where:{
                            postId:postId
                }
                });
                // user의 likes에 postid 추가
                await User.update({
                    likes : s},{
                    where:{
                        userId:userId
                    }
                });
            }else{
                for(let i =0; i<li.length; i++){
                    s = s+" "+li[i];
                }
                s = s+" "+postId;
                s = s.trim();

                await Board.update({
                    likes : post.likes+1},{
                    where:{
                        postId:postId
                    }
                });
                await User.update({
                    likes : s},{
                    where:{
                        userId:userId
                    }
                });
            }
        }
        res.status(200).json({msg:"좋아요 처리 완료"})
    }catch(e){
        res.status(400).json({errorMessage:"나도모른다고 샹"})
    }


})
// 좋아요 게시판
router.get("/posts/likes",authMiddleware,async (req,res)=>{
    try{
    const {token} = req.cookies;
    const {userId} = jwt.decode(token);
        const bb = [];
        const userlikes = await User.findOne({
            where:{userId:userId}
        });
    //     좋아요 글이 없을때
        if(userlikes===null||userlikes===""){
            res.json({msg:"좋아요 하신 글이 없습니다."});
            return;
        }else{
            let as = userlikes.likes.split(" ");
            for(let i=0; i<as.length; i++){
                const like = await Board.findOne({
                    where:{postId:as[i]}
                });
                bb.push(like);
            }
        }
        res.render("like",{title:"like 목록",likes:bb});
    }catch(e){
        console.log(e);
        // res.status(400).json({errorMessage:"에러메시지 나도 모른다고"});
    }
});
module.exports = router;