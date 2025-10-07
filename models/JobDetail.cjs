const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobDetailsSchema = new Schema({
    jobId: Number,
    type: String,
    salary: String,
    skills: [String],
    description: String,
    benefits: [String],
    link: String,
    creationDate: String,
});

module.exports = mongoose.model('jobs_details', jobDetailsSchema);