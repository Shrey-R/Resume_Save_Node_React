const express = require('express')
const { getResumeById } = require('../../controllers/resume')
const router = express.Router()

router.route('/:id').get(getResumeById)

module.exports = router
