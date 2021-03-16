const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const { userRouter, homeRouter, followerRouter, mypageRouter, courseRouter, searchRouter } = require('./routes');

const server = async() => {
    try {
        const { MONGO_URI, PORT } = process.env;
        if(!MONGO_URI) throw new Error("MONGO_URI is required!!")
        if(!PORT) throw new Error("PORT is required!!")

        await mongoose.connect(MONGO_URI, 
            {   useNewUrlParser: true, useUnifiedTopology: true, 
                useCreateIndex: true, useFindAndModify: false 
            }, (err) => {
            if(err) console.log({ err })
        });
        mongoose.set("debug", true);
        console.log('MongoDB connected...')

        app.use(cors())
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json())
        app.use(cookieParser())
        app.use(express.json())

        app.use('/users', userRouter)
        app.use('/home', homeRouter)
        app.use('/follower', followerRouter)
        app.use('/mypage', mypageRouter)
        app.use('/course', courseRouter)
        app.use('/search', searchRouter)

        app.listen(PORT, async () => {
            try {
                console.log(`server listening on port ${PORT}`);
            } catch (err) {
                console.log({ err })
            }
        })
    } catch(err) {
        console.log({ err })
    }
}

server();

