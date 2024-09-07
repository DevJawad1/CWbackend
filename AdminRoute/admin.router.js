const express = require('express')
const multer = require('multer');

const {allBookedCar} = require('../AdminController/getBookedCar.controller')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/tmp');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
const upload = multer({ storage });
const router = express.Router()

router.post('/allbookedCar', allBookedCar)


module.exports= router