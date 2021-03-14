const { Router } = require('express');
const userRouter = Router();
const mongoose = require('mongoose');
const { User } = require('../models');
const { auth } = require("../middleware/auth");

//=================================
//             User
//=================================

/* 인증 */
userRouter.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        id: req.user.id,
        followingNumber: req.user.followingNumber,
        followerNumber: req.user.followerNumber,
        courseNumber: req.user.courseNumber,
        image: req.user.image
    });
});

/* 회원가입 */
userRouter.post("/register", (req, res) => {
    const user = new User(req.body);
    if (!user.email || !user.name || !user.password || !user.id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "필요한 값이 없습니다."
        })
    }

    user.save((err, doc) => {
        if (err) 
            return res.json({  
                status: 500,
                success: false,
                message: "서버 내부 에러"
            });
        return res.status(200).json({
            status: 200,
            success: true,
            message: "회원가입성공",
            data: {
                name: user.name,
                email: user.email,
                id: user.id,
            }
        });
    });
});

/* 로그인 */
userRouter.post("/login", (req, res) => {
    const user = new User(req.body);
    if (!user.password || !user.id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "필요한 값이 없습니다."
        })
    }

    User.findOne({ id: req.body.id }, (err, user) => {
        if (!user)
            return res.json({
                status: 400,
                success: false,
                message: "존재하지 않는 유저입니다."
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ 
                    status: 400,
                    success: false,
                    message: "비밀번호가 일치하지 않습니다."
                 });

            user.generateToken((err, user) => {
                if (err) return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "Token 생성 에러."
                });
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        status: 200,
                        success: true,
                        message: "로그인 성공",
                        data: {
                            name: user.name,
                            email: user.email,
                            id: user.id,
                            accessToken: user.token
                        }
                    });
            });
        });
    });
});

/* 아이디 비밀번호 찾기 */
userRouter.post('/findUser', async (req, res) => {
    const user = new User(req.body);
    if (!user.id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "필요한 값이 없습니다."
        })
    }

    User.findOne({ id: req.body.id }, (err, user) => {
        if (!user)
            return res.json({
                status: 400,
                success: false,
                message: "존재하지 않는 유저입니다."
            });
        return res.status(200).json({
            status: 200,
            success: true,
            message: "아이디 찾기 성공"
        })
    });
})

/* 로그아웃 */
userRouter.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
        
        console.log(auth.user)

        res.clearCookie("w_auth")
        res.clearCookie("w_authExp")
        return res.status(200).json({
            status: 200,
            success: true,
            message: "로그아웃 성공"
        });
    });
});

/* 유저 정보 가져오기 */
userRouter.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        return res.send({ users })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
})

module.exports = { userRouter }