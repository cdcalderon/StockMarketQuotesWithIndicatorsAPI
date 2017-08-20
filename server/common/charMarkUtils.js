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
        strDate: new Date(quote.timeStampDate * 1000).toString(),
        color:"green",
        text:"3 Green Arrows",
        label:"^",
        labelFontColor:"black",
        minSize:20,
        high: quote.high,
        low: quote.low,
        close: quote.close
    }
}


let formatStoch307ChartMarks = (quotes) => {

    return quotes.map((q, i) => {
        return {
            id:i,
            time:q.timeStampDate,
            strDate: new Date(q.timeStampDate * 1000).toString(),
            color:"yellow",
            text:"Stoch 307",
            label:"S307",
            labelFontColor:"black",
            minSize:20,
            high: q.high,
            low: q.low,
            close: q.close
        }
    });
};

module.exports = {
    formatMarksResult,
    formatGapChartMark,
    formatThreeArrowChartMark,
    formatStoch307ChartMarks
};