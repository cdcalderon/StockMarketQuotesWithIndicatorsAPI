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
    movingAvg10: {
      type: Number,
      default: null
    },
    movingAvg30: {
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
    isGreenArrow: {
      type: Boolean,
      default: null
    },
    isRedArrow: {
      type: Boolean,
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
    }

});

schema.plugin(mongoosePaginate);
let ThreeArrowSignal = mongoose.model('ThreeArrowSignal', schema);

module.exports = {
    ThreeArrowSignal
};