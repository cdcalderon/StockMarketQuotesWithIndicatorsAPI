var mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate');

let schema = new mongoose.Schema({
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
    dateId: {
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
    adjClose: {
        type: Number,
        default: null
    },
    movingExAvg7: {
        type: Number,
        default: null
    },
    movingExAvg30: {
        type: Number,
        default: null
    },
    stochasticsK: {
        type: Number,
        default: null
    },
    stochasticsD: {
        type: Number,
        default: null
    },
    macd: {
        type: Number,
        default: null
    },
    macdHistogram: {
        type: Number,
        default: null
    },
    macdSignal: {
        type: Number,
        default: null
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
    },
    marketCapNumeric: {
        type: Number,
        default:null
    },
    marketCap: {
        type: String,
        default: ''
    },
    movingExAvg30PositiveSlope: {
        type: Number,
        default:null
    },
    directionType: {
        type: String,  // bull or bear
        default: ''
    }

});

schema.plugin(mongoosePaginate);
let Stoch307Signal = mongoose.model('Stoch307Signal', schema);

module.exports = {
    Stoch307Signal
};


// {
//     "date": "2017-04-20",
//     "open": 141.22,
//     "close": 142.44,
//     "high": 142.92,
//     "low": 141.16,
//     "MACD": -1.14559,
//     "MACDSignal": 0.16883,
//     "histogram": -1.31442,
//     "stochasticsK": 53.36322869955138,
//     "stochasticsD": 53.36322869955138,
//     "XMA7": 141.82338,
//     "XMA30": 140.8669,
//     "EMA30PositiveSlope": 4,
//     "isXMA7CrossingUp": true,
//     "isMACDCrossingUp": false,
//     "isSTOCHCrossingUp": true,
//     "isvalid": true
// }