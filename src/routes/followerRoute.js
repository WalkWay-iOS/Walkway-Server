const { Router } = require('express');
const followerRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Record, Follower } = require('../models');

//=================================
//             Follower
//=================================

/* 팔로워 화면 */
followerRouter.get('/:userId', async (req, res) => {
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

/* 팔로우 */
followerRouter.post('/:userId/follow', async (req, res) => {
    try {
        const { userId } = req.params
        const { userFrom } = req.body

        console.log(userFrom)

        const [ userToId, userFromId ] = await Promise.all([
            User.findById(userId, {}, {  }),
            User.findById(userFrom, {}, {  })
        ])
        if(!userToId || !userFromId) 
                return res.status(400).json({ 
                    status: 400,
                    success: false,
                    message: "존재하지 않는 유저입니다."
                 });

        const follower = new Follower({ userTo: userId, userFrom: userFrom })

        await follower.save((err, doc) => {
            if(err) return res.status(400).json({ 
                status: 400,
                success: false,
                message: "팔로우 저장을 실패하였습니다.", 
            })
            return res.status(200).json({
                status: 200,
                success: true,
                message: "팔로우 성공",
                data: {
                    follow: {
                        userTo: follower.userTo,
                        userFrom: follower.userFrom
                    }
                }
            })
        })
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
    }
})

/* 언팔로우 */
followerRouter.post('/:userId/unfollow', async (req, res) => {
    try {
        const { userId } = req.params
        const { userFrom } = req.body
        const [ userToId, userFromId ] = await Promise.all([
            User.findById(userId, {}, {  }),
            User.findById(userFrom, {}, {  })
        ])
        if(!userToId || !userFromId) 
                return res.status(400).json({ 
                    status: 400,
                    success: false,
                    message: "존재하지 않는 유저입니다."
                 });

        await Follower.findOneAndDelete({ userTo: userId, userFrom: userFrom })
            .exec((err, doc) => {
                if(err) return res.status(400).json({ 
                    status: 400,
                    success: false,
                    message: "팔로우 삭제를 실패하였습니다.", 
                })
                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: "언팔로우 성공"
                })
        })
    } catch (err) {
        return res.status(500).json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
    }
})

module.exports = { followerRouter }