const { Router } = require('express');
const courseRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Hashtag } = require('../models');
const { auth } = require("../middleware/auth");

//=================================
//             Course
//=================================

/* 코스 생성 화면 */
courseRouter.post('/create', auth, async (req, res) => {
    try {
        const { title, distance, time, content, hashtag, position } = req.body
        if(typeof title !== 'string') 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "title를 넣어주세요."
            });
        if(typeof content !== 'string') 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "content를 넣어주세요."
            });
        if(typeof distance !== 'number') 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "distance를 넣어주세요."
            });
        if(typeof time !== 'string') 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "time를 넣어주세요."
            });
        if(!mongoose.isValidObjectId(req.user._id)) 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "유효하지 않은 사용자입니다."
            });
        let user = await User.findById(req.user._id)
        if(!user) 
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "사용자가 존재하지 않습니다."
            });
            
        let tags = []
        for (let tag of hashtag) {
            const hash = await Hashtag.findOne({ 'keyword': tag.keyword })
            if(hash !== null) {
                await Hashtag.updateOne(
                    { 'keyword': tag.keyword }, 
                    { $inc: { referCount: 1 } }, { new: true }
                )
                tags.push(hash)
            } else {
                const newHashtag = new Hashtag(tag)
                tags.push(newHashtag)
                await newHashtag.save()
            }
        }

        const pos = position[0]
        let result = false
        if((pos[0] > 37.44 && pos[0] < 37.74) && (pos[1] > 126.8 && pos[1] < 127.18)) {
            result = true
        }

        let course = new Course({ ...req.body, user, hashtag: tags, isSeoul: result })
        await course.save()

        return res.status(200).json({
            status: 200,
            success: true,
            message: "경로 생성 완료",
            data: {
                course: course
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

/* 공식 코스로 변경 */
courseRouter.put('/change/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { official } = req.body;

        const course = await Course.findOneAndUpdate({ _id: courseId }, { official }, { new: true })

        return res.status(200).json({
            status: 200,
            success: true,
            message: "해당 코스를 공식 코스로 변경 완료",
            data: {
                course: course
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

/* 코스 세부정보 가져오기 */
courseRouter.get('/:courseId/detail', async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId)

        return res.status(200).json({
            status: 200,
            success: true,
            message: "코스 세부정보를 가져왔습니다.",
            data: {
                course: course
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

module.exports = { courseRouter }