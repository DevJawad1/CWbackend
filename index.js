const express = require('express')
const app = express()
const mongoose= require('mongoose')
const cors = require('cors')
const env = require('dotenv').config()
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
// listen
app.listen(PORT, ()=>{
    console.log("listen to 4000");
})