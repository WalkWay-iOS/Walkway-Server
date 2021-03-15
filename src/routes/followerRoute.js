const { Router } = require('express');
const followerRouter = Router();
const mongoose = require('mongoose');
const { User, Course, Record, Follower } = require('../models');
const { auth } = require("../middleware/auth");

//=================================
//             Follower
//=================================

/* 팔로워 화면 */
followerRouter.get('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params
        if(!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: "존재하지 않는 유저입니다."
            })
        }

        const [ follower, courses, records, following ] = await Promise.all([
            User.findOne({ _id: userId }),
            Course.find({ 'user._id': userId }),
            Record.find({ 'userId': userId }).sort({ createdAt: -1 }).limit(5),
            Follower.find({ 'userTo': userId, 'userFrom': req.user._id })
        ]) 

        let result = false
        if(following.length !== 0) {
            result = true
        } 

        return res.status(200).json({
            status: 200,
            success: true,
            message: "팔로워 화면 조회 성공",
            data: {
                isFollowing: result,
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
followerRouter.get('/:userId/follow', auth, async (req, res) => {
    try {
        const { userId } = req.params
        const [ userToId, userFromId ] = await Promise.all([
            User.findById(userId, {}, {  }),
            User.findById(req.user._id, {}, {  })
        ])
        if(!userToId || !userFromId) 
                return res.status(400).json({ 
                    status: 400,
                    success: false,
                    message: "존재하지 않는 유저입니다."
                 });

        const follower = new Follower({ userTo: userId, userFrom: req.user._id })

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
followerRouter.get('/:userId/unfollow', auth, async (req, res) => {
    try {
        const { userId } = req.params
        const [ userToId, userFromId ] = await Promise.all([
            User.findById(userId, {}, {  }),
            User.findById(req.user._id, {}, {  })
        ])
        if(!userToId || !userFromId) 
                return res.status(400).json({ 
                    status: 400,
                    success: false,
                    message: "존재하지 않는 유저입니다."
                 });

        await Follower.findOneAndDelete({ userTo: userId, userFrom: req.user._id })
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