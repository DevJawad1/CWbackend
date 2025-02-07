const express = require('express')
const mongoose= require('mongoose')
const cors = require('cors')
const app = express()
const env = require('dotenv').config()
const userRouter = require ('./Routers/user.router')
const adminRouter = require('./AdminRoute/admin.router')
PORT = process.env.PORT
URI=process.env.URI

// connecting
mongoose.connect(URI).then(()=>{
    console.log('App connected to database successfully');
}).catch(err=>{
    console.log("Erorr occour while connecting to database", err);
})

// use
app.use(cors())
app.use(express.urlencoded({extended:true, limit: '50mb'}))
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.use('/member', userRouter)
app.use('/admin', adminRouter)
app.use(express.static("public"))
// listen

app.get('/server-date', (req, res) => {
    res.json({ serverDate: new Date().toISOString().split('T')[0] });
});
app.listen(PORT, ()=>{
    console.log("listen to ", PORT);
})