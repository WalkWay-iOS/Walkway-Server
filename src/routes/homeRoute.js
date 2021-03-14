const { Router } = require('express');
const homeRouter = Router();
const mongoose = require('mongoose');
const { User } = require('../models');

//=================================
//             Home
//=================================

homeRouter.get('/', async (req, res) => {
    try {
        // followerTVC
        const users = await User.find({}).sort({ followingNumber: -1 }).limit(10);

        // popularTVC
        // const popularCourse = await  

        return res.status(200).json({
            status: 200,
            success: true,
            message: "메인 홈 조회 성공",
            data: {
                follower: [{
                    name: users.name,
                    image: users.image,
                    userId: users._id
                }]
            }
        });
    } catch (err) {
        return res.json({  
            status: 500,
            success: false,
            message: "서버 내부 에러"
        });
    }
})

module.exports = { homeRouter }