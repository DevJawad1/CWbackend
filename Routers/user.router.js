const multer = require('multer');
const express = require('express')
const {registerUser, loginMember} = require('../Controllers/auth.controller')
const {userDetails} = require('../Controllers/dashboard.controller')
const {registerCar, saveCarImg, userCars}= require('../Controllers/caruploading.controller')
const {createFlw, WebHook, verifyUserpayment} = require('../Controllers/payment.controller')
const {saveBookCar} = require('../Controllers/BookCar.controller')
// Configure multer for file upload, using /tmp directory
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
router.post('/register', registerUser)
router.post('/loginMember', loginMember)
router.post('/userDetails', userDetails)
router.post('/registerCar', registerCar)
router.post('/saveCarImg',upload.single('file'), saveCarImg)
router.post('/myCar', userCars)
router.post('/virtualaccount', createFlw)
router.post('/webhook', WebHook)
router.post('/verifyPayment', verifyUserpayment)
router.post('/savebookcar', saveBookCar)

module.exports = router