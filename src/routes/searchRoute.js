const { Router } = require('express');
const searchRouter = Router();
const mongoose = require('mongoose');
const { Course, Hashtag } = require('../models');

//=================================
//             Search
//=================================

/* 해시태그 클릭 검색 화면 */
searchRouter.get('/:keywordId', async (req, res) => {
    try {
        const { keywordId } = req.params
        
        const courses = await Course.find({ 'hashtag._id': keywordId }).sort({ usesCount: -1 }).limit(30)

        return res.status(200).json({
            status: 200,
            success: true,
            message: "해당 해시태그를 가지고 있는 코스를 가져왔습니다",
            data: {
                courses: courses
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

/* 단어 검색 화면 */
searchRouter.get('/', async (req, res) => {
    try {
        let { word, mode } = req.query
        mode = parseInt(mode)
        
        if(mode === 0) {
            const courses = await Course.find({ $text: { $search: word } })

            return res.status(200).json({
                status: 200,
                success: true,
                message: "검색 완료",
                data: {
                    courses: courses
                }
            })
        } else {
            // bookmark, trend, follow
            const hashtag = await Hashtag.find({}).sort({ referCount: -1 }).limit(7)

            return res.status(200).json({
                status: 200,
                success: true,
                message: "해시태그 준비 완료",
                data: {
                    hashtag: hashtag
                }
            })
        }
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러",
            err: err.message
        });
    }
})

module.exports = { searchRouter }