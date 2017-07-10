var mongoose = require('mongoose');

var GapSignal = mongoose.model('GapSignal', {
    symbol: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    dateStr: {
        type: String,
        default: null
    },
    dateId:{
        type: Number,
        default: null
    },
    open: {
        type: Number,
        default: null
    },
    high: {
        type: Number,
        default: null
    },
    low: {
        type: Number,
        default: null
    },
    close: {
        type: Number,
        default: null
    },
    volume: {
        type: Number,
        default: null
    },
    gapSize: {
        type: Number,
        default: null
    },
    previousClose: {
        type: Number,
        default: null
    },
    direction: {
        type: String,
        default: ''
    },
    exchange: {
        type: String,
        default: ''
    },
    summaryQuoteUrl: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    sector: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    }
});

module.exports = {
    GapSignal
};