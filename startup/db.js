const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function(){
    mongoose.connect('mongodb://localhost/hr_solution')
    .then(() => winston.info('conected to mongodb database successfully....'))
    .catch(() =>winston.info('mongodb connection fail..'));
}