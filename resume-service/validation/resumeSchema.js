const Joi = require('joi');

const resumeSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    job_title: Joi.string().min(3).max(100).required(),
    job_description: Joi.string().min(10).max(500).required(),
    job_company: Joi.string().min(3).max(100).required(),
});

module.exports = {resumeSchema};
