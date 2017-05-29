var mongoose = require('mongoose');

var ThreeArrowSignal = mongoose.model('ThreeArrowSignal', {
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
    }
});

module.exports = {
    ThreeArrowSignal
};