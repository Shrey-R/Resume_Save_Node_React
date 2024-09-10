const express = require('express')
const { uploadResumeDetails } = require('../../controllers/resume')
const router = express.Router()

router.route('/').post(uploadResumeDetails)

module.exports = router
