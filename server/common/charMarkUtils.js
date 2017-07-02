const _ = require('lodash-node');
const moment = require('moment');

let formatMarksResult = (signals) => {
    return {
        id: _.pluck(signals, 'id'),
        time: _.pluck(signals, 'time'),
        color: _.pluck(signals, 'color'),
        text: _.pluck(signals, 'text'),
        label: _.pluck(signals, 'label'),
        labelFontColor: _.pluck(signals, 'labelFontColor'),
        minSize: _.pluck(signals, 'minSize')
    }
}

let formatGapChartMark = (quote, index) => {
    return {
        id:index,
        time:quote.timeStampDate,
        dateStr: moment(new Date(quote.timeStampDate * 1000)).format('ll'),
        color:"blue",
        text:"Gap",
        label:"G",
        labelFontColor:"black",
        minSize:20,
        previousQuote: quote.previousQuote,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        close: quote.close,
        direction: quote.direction,
        gapSize: quote.gapSize,
        previousClose: quote.previousQuote.close

    }
}

let formatThreeArrowChartMark = (quote, index) => {
    return {
        id:index,
        time:quote.timeStampDate,
        color:"green",
        text:"3 Green Arrows",
        label:"^",
        labelFontColor:"black",
        minSize:20
    }
}

module.exports = {
    formatMarksResult,
    formatGapChartMark,
    formatThreeArrowChartMark
};