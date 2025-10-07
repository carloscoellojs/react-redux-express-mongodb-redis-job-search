const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobTitleSchema = new Schema({
    id: Number,
    title: String,
    company: String,
    location: String,
    creationDate: String
});

module.exports = mongoose.model('jobs_titles', jobTitleSchema);