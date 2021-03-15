const { Router } = require('express');
const mypageRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Record } = require('../models');
const { auth } = require("../middleware/auth");

//=================================
//             Mypage
//=================================

/* 마이페이지 화면 */
mypageRouter.get('/', auth, async (req, res) => {
    try {
        const userId = req.user._id
        const [ follower, courses, records ] = await Promise.all([
            User.findOne({ _id: userId }),
            Course.find({ 'user._id': userId }),
            Record.find({ 'userId': userId }).sort({ createdAt: -1 }).limit(3)
        ])

        return res.status(200).json({
            status: 200,
            success: true,
            message: "마이페이지 화면 조회 성공",
            data: {
                user: follower,
                course: courses,
                record: records
            }
        })
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
    }
})

module.exports = { mypageRouter }