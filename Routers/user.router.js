const express = require('express')
const {registerUser, loginMember} = require('../Controllers/auth.controller')
const router = express.Router()
router.post('/register', registerUser)
router.post('/loginMember', loginMember)

module.exports = router