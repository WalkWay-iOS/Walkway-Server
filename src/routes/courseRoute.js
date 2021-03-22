const { Router } = require('express');
const courseRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Hashtag, Comment, Record, Hotplace } = require('../models');
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
            console.log(tag)
            const hash = await Hashtag.findOne({ 'keyword': tag })
    
            if(hash !== null) {
                await Hashtag.updateOne(
                    { 'keyword': tag}, 
                    { $inc: { referCount: 1 } }, { new: true }
                )
                tags.push(hash)
            } else {
                const newHashtag = new Hashtag({ 'keyword': tag })
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
        await course.save((err, doc) => {
            if (err) {
                console.log(err.message)
                return res.status(400).json({ success: false, err });
            }
            return res.status(200).json({
                status: 200,
                success: true,
                message: "경로 생성 완료",
                data: {
                    course: course
                }
            })
        });

        
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러",
            err: err.message
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
        const comment = await Comment.find({ courseId }).sort({ createdAt: -1 }).limit(3)

        return res.status(200).json({
            status: 200,
            success: true,
            message: "코스 세부정보를 가져왔습니다.",
            data: {
                course: course,
                comment: comment
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

/* 코스 후기 전체보기 */
courseRouter.get('/:courseId/detail/comment', async (req, res) => {
    try {
        const { courseId } = req.params;
        const comment = await Comment.find({ courseId }).sort({ createdAt: -1 })

        return res.status(200).json({
            status: 200,
            success: true,
            message: "코스 후기 전체보기 완료",
            data: {
                comment: comment
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

/* 러닝 코스 정보 전달 */
courseRouter.get('/:courseId/running', async (req, res) => {
    try {
        const { courseId } = req.params;
        const [{ position, content }, hotplaces] = await Promise.all([
            Course.findById(courseId), Hotplace.find({})
        ])

        let landmark = []
        const posStart = position[0]
        const posDestin = position[1]
        const posMidLong = (posStart[0] + posDestin[0]) / 2
        const posMidLati = (posStart[1] + posDestin[1]) / 2
        for(let place of hotplaces) {
            if((place.position[0] >= posMidLong - 0.024 && place.position[0] <= posMidLong + 0.024) &&
                (place.position[1] >= posMidLati - 0.024 && place.position[1] <= posMidLati + 0.024)) {
                    landmark.push(place.name)
                }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "러닝 코스 정보 전달 완료",
            data: {
                content: content,
                position: position,
                landmark: landmark
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

/* 러닝 레코드 저장 */
courseRouter.post('/:courseId/record', auth, async (req, res) => {
    try {
        const { courseId } = req.params
        const { comment, strength, rate } = req.body

        const [{ strengthAverage, rateAverage, usesCount, title }, { id }] = await Promise.all([
            Course.findById(courseId), User.findById(req.user._id)
        ])
        const strAve = ((strengthAverage * usesCount) + strength) / (usesCount + 1)
        const rateAve = ((rateAverage * usesCount) + rate) / (usesCount + 1)

        const userComment = new Comment({ userId: req.user._id, courseId , content: comment, userName: id, rate: rate })
        const record = new Record({ ...req.body, courseName: title, comment: userComment, userId: req.user._id, courseId})

        const course = await Course.findOneAndUpdate(
            { _id: courseId },
            { $inc: { usesCount: 1 }, strengthAverage: strAve, rateAverage: rateAve }, { new: true }
        )

        await Promise.all([
            userComment.save(),
            record.save()
        ])

        return res.status(200).json({
            status: 200,
            success: true,
            message: "러닝 레코드 저장 완료",
            data: {
                record: record,
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

/* 핫플레이스 저장 */
courseRouter.post('/hotplace', async (req, res) => {
    try {
        const place = new Hotplace(req.body)

        await place.save()

        return res.status(200).json({
            status: 200,
            success: true,
            message: "새로운 핫플레이스 생성",
            data: {
                hotplace: place
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