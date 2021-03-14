const { Router } = require('express');
const homeRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Bookmark } = require('../models');

//=================================
//             Home
//=================================

/* 메인 홈 화면 */
homeRouter.get('/', async (req, res) => {
    try {
        const [ followers, popularCourses, bookmarkCourses, latestCourses ] = await Promise.all([
            User.find({}).sort({ followingNumber: -1 }).limit(10),
            Course.find({}).limit(7),
            Course.find({}).sort({ bookmarkCount: -1 }).limit(7),
            Course.find({}).sort({ createdAt: -1 }).limit(7)
        ])

        return res.status(200).json({
            status: 200,
            success: true,
            message: "메인 홈 조회 성공",
            data: {
                follower: followers,
                popularCourse: popularCourses,
                bookmarkCourse: bookmarkCourses,
                latestCourse: latestCourses
            }
        });
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
    }
})

module.exports = { homeRouter }