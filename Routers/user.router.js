const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const express = require('express')
const {registerUser, loginMember} = require('../Controllers/auth.controller')
const {userDetails} = require('../Controllers/dashboard.controller')
const {registerCar, saveCarImg}= require('../Controllers/caruploading.controller')
const router = express.Router()
router.post('/register', registerUser)
router.post('/loginMember', loginMember)
router.post('/userDetails', userDetails)
router.post('/registerCar', registerCar)
router.post('/saveCarImg',upload.single('file'), saveCarImg)

module.exports = router