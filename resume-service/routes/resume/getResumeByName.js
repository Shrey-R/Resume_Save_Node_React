const express = require('express')
const { getResumeByName } = require('../../controllers/resume')
const router = express.Router()

router.route('/:name').get(getResumeByName)

module.exports = router
