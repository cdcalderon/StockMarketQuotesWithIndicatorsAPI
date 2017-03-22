var mongoose = require('mongoose');

var StockEarning = mongoose.model('StockEarning', {
    symbol: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    reportDateStr: {
        type: String,
        default: null
    },
    reportTimeStr: {
        type: String
    },
    periodEnding: {
        type: String
    },
    eps: {
        type: String
    },
    reportedEPS: {
        type: Number
    },
    consensus: {
        type: Number
    },
    bpConsensus: {
        type: Number
    },
    ratingPriceTarget: {
        type: Number
    },
    ratingNumBuys: {
        type: Number
    },
    ratingNumHolds: {
        type: Number
    },
    ratingNumSells: {
        type: Number
    },
    bpRatingPriceTarget: {
        type: Number
    },
    bpRatingNumBuys: {
        type: Number
    },
    bpRatingNumHolds: {
        type: Number
    },
    bpRatingNumSells: {
        type: Number
    },
    marketCap: {
        type: Number
    },
    sector: {
        type: Number
    },
    surprise: {
        type: Number
    },
    timeOfDay: {
        type: Number
    },
    isConfirmed: {
        type: Boolean
    }
});

module.exports = {
    StockEarning
};