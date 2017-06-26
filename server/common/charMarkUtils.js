const _ = require('lodash-node');

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
        color:"blue",
        text:"Gap",
        label:"G",
        labelFontColor:"black",
        minSize:20,
        previousQuote: quote.previousQuote,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        direction: quote.direction,
        gapSize: quote.gapSize

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