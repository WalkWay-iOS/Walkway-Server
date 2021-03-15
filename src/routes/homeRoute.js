const { Router } = require('express');
const homeRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Bookmark, Record } = require('../models');

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
        })
    }
})

/* 인기 코스 화면 */
homeRouter.get('/populars', async (req, res) => {
    try {
        const { isSeoul } = req.query
        let courses;
        
        if(isSeoul === 'true') {
            courses = await Course.find({ isSeoul: true }).limit(100)
        } else {
            courses = await Course.find({ isSeoul: false }).limit(100)
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "인기 코스 화면 조회 성공",
            data: {
                course: courses
            }
        });
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        })
    }
})

/* 북마크 코스 화면 */
homeRouter.get('/bookmarks', async (req, res) => {
    try {
        const { isBookmark } = req.query
        let courses;
        
        if(isBookmark === 'true') {
            courses = await Course.find({}).sort({ bookmarkCount: -1 }).limit(100)
        } else {
            courses = await Course.find({}).sort({ rateAverage: -1 }).limit(100)
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "북마크 코스 화면 조회 성공",
            data: {
                course: courses
            }
        });
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        })
    }
})

/* 최신 코스 화면 */
homeRouter.get('/latest', async (req, res) => {
    try {
        let { page=0 } = req.query;
        page = parseInt(page);
        const courses = await Course.find({}).sort({ createdAt: -1 }).skip(page * 20).limit(20)

        return res.status(200).json({
            status: 200,
            success: true,
            message: "최신 코스 화면 조회 성공",
            data: {
                course: courses
            }
        });
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        })
    }
})

/* 팔로워 화면 */
homeRouter.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        if(!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "존재하지 않는 유저입니다."
            })
        }

        const [ follower, courses, records ] = await Promise.all([
            User.findOne({ _id: userId }),
            Course.find({ 'user._id': userId }),
            Record.find({ 'userId': userId }).sort({ createdAt: -1 }).limit(5)
        ])

        return res.status(200).json({
            status: 200,
            success: true,
            message: "팔로워 화면 조회 성공",
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

module.exports = { homeRouter }