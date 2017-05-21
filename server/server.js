var express = require('express');
var bodyParser = require('body-parser');
var quotes = require('./services/quotes.jobs');
var cors = require('cors');
var querystring = require('querystring');
const _ = require('lodash-node');
var { mongoose } = require('./db/mongoose');

var { ThreeArrowSignal } = require('./models/threeArrowSignal');
var { GapSignal } = require('./models/gapSignal');
var quotes = require('./services/quotes.jobs');
const axios = require('axios');
const historyQuotes = 'https://demo_feed.tradingview.com/history';
const symbolsQuotes = 'https://demo_feed.tradingview.com/symbols';
const marksQuotes = 'https://demo_feed.tradingview.com/marks';
const timescale_marksQuotes = 'https://demo_feed.tradingview.com/timescale_marks';
const configQuotes = 'https://demo_feed.tradingview.com/config';
const moment = require('moment');

var app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

//quotes.populateThreeArrowSignal("01/01/16", "04/04/17", "aapl");

app.post('/threearrowsignals', (req, res) => {
    let symbol = req.body.params.symbol;
    let from = new Date(req.body.params.from);
    let to = new Date(req.body.params.to);

    quotes.populateThreeArrowSignal(from, to, symbol)
        .then((result) => {
        console.log(`about to send response::  ${result}` );
            res.send("OK");
        });
});

app.get('/threearrowsignals', (req, res) => {
    let symbol = req.query.symbol;
    let from = new Date(req.query.from);
    let to = new Date(req.query.to);

    ThreeArrowSignal.find().then((signals) => {
        res.send(signals)
    });
});

app.post('/gapsignals', (req, res) => {
    let symbol = req.body.params.symbol;
    let from = new Date(req.body.params.from);
    let to = new Date(req.body.params.to);

    quotes.populateGapSignals(from, to, symbol)
        .then((result) => {
            console.log(`about to send response::  ${result}` );
            res.send("OK");
        });
});

app.get('/gapsignals', (req, res) => {
    let symbol = req.query.symbol;
    let from = new Date(req.query.from);
    let to = new Date(req.query.to);

    GapSignal.find().then((signals) => {
        res.send(signals)
    });
});

app.get('/signals', (req, res) => {
    let symbol = req.query.symbol;
    let from = new Date(req.query.from);
    let to = new Date(req.query.to);
    quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            let threeArrowSignals = getThreeArrowSignals(fullQuotes);

            let gapSignals = getGapSignals(fullQuotes);

            let mergedSignals = mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

            res.send(mergedSignals);
        })
        .catch((error) => {
            console.log(error);
        });

});

app.get('/quotes', (req, res) => {
    quotes.getHistoricalQuotes(req.query.symbol, req.query.from, req.query.to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {
            res.send(fullQuotes);
        });
});

app.get('/config', (req, res) => {
    res.send(tradingViewConfig);
});

app.get('/symbols', (req, res) => {
    let symbol = req.query.symbol;

    axios.get(symbolsQuotes, {
        params: {
            symbol: symbol
        }
    }).then(function(data) {
        res.send(data.data)
    }).catch(function(err){
        res.send(err)
    });
});

app.get('/marks', (req, res) => {
    let symbol = req.query.symbol;
    let resolution = req.query.resolution;
    let from = moment.unix(req.query.from).format("MM/DD/YYYY");
    let to = moment.unix(req.query.to).format("MM/DD/YYYY");
    quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

        let threeArrowSignals = getThreeArrowChartMarks(fullQuotes);

        let gapSignals = getGapChartMarks(fullQuotes);

        let mergedSignals = mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

        let marks = formatMarksResult(mergedSignals);

        res.send(marks);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/marksgaps', (req, res) => {
    let symbol = req.query.symbol;
    let resolution = req.query.resolution;
    let from = moment.unix(req.query.from).format("MM/DD/YYYY");
    let to = moment.unix(req.query.to).format("MM/DD/YYYY");
    quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            //let threeArrowSignals = getThreeArrowChartMarks(fullQuotes);

            let gapSignals = getGapChartMarks(fullQuotes);

           // let mergedSignals = mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

            let marks = formatMarksResult(gapSignals);

            res.send(marks);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/marksgreenarrows', (req, res) => {
    let symbol = req.query.symbol;
    let resolution = req.query.resolution;
    let from = moment.unix(req.query.from).format("MM/DD/YYYY");
    let to = moment.unix(req.query.to).format("MM/DD/YYYY");
    quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            let threeArrowSignals = getThreeArrowChartMarks(fullQuotes);

           // let gapSignals = getGapChartMarks(fullQuotes);

           // let mergedSignals = mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

            let marks = formatMarksResult(mergedSignals);

            res.send(marks);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/timescale_marks', (req, res) => {
    let symbol = req.query.symbol;
    let resolution = req.query.resolution;
    let from = new Date(req.query.from);
    let to = new Date(req.query.to);

    axios.get(timescale_marksQuotes, {
        params: {
            symbol: symbol, resolution: resolution, from: from, tom: to
        }
    }).then(function(data) {
        res.send(data.data)
    }).catch(function(err){
        res.send(err)
    });
});

//Implement new yahoo UDP quotes service
//https://github.com/tradingview/yahoo_datafeed/blob/master/yahoo.js
app.get('/history', (req, res) => {
    let symbol = req.query.symbol;
    let resolution = req.query.resolution;
    let from = req.query.from;
    let to = req.query.to;

    axios.get(historyQuotes, {
        params: {
            symbol: symbol, resolution: resolution, from: from, tom: to
        }
    }).then(function(data) {
        res.send(data.data)
    }).catch(function(err){
        res.send(err)
    });
});

let getThreeArrowSignalRequest = (from, to, symbol) => {
    return quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            return  getThreeArrowChartMarks(fullQuotes);

        });
};

let notReturn = (qToday, qYesterday)=> {
    if(qToday.open > qYesterday.close) {
        if(qToday.close > qYesterday.close && qToday.close > qYesterday.open) {
            return true
        }
    }

    if(qToday.open < qYesterday.close) {
        if(qToday.close < qYesterday.close && qToday.close < qYesterday.open) {
            return true
        }
    }

};

let getDiffAmount = (q) => {
    if(q.close > 0  && q.close < 200) {
        return 3.5;
    } else if (q.close > 200 && q.close < 400){
        return 5;
    } else if(q.close > 400 && q.close < 600) {
        return 6.5
    } else if(q.close > 600) {
        return 8
    }
};



// Helper functions , NOTE: refactor and move to helper library

function getThreeArrowSignals(fullQuotes){
    return fullQuotes.filter((q) => {
        return q.is3ArrowGreenPositive === true;
    }).map((q, i) => {
        return formatSignals(q, i, '3arrow', 2);
    });
}

function getGapSignals(fullQuotes) {
    return fullQuotes.filter((q,i,qts) => {
        let diffCriteria = getDiffAmount(q);
        let diffCriteriaPercent = q.close * .10;
        if(i > 0) {
            let diffBetweenCurrentPreviousClose = Math.abs((q.close - qts[i-1].close));
            let diffBetweenCurrentOpenPreviousClose = Math.abs((q.open - qts[i-1].close));
            return ((diffBetweenCurrentPreviousClose > diffCriteria) || (diffBetweenCurrentPreviousClose >= diffCriteriaPercent)) &&
                ((diffBetweenCurrentOpenPreviousClose > diffCriteria) || (diffBetweenCurrentOpenPreviousClose >= diffCriteriaPercent));
        }
        return false;
    }).map((q, i) => {
        return formatSignals(q, i, 'gap', 1);
    });
}

function getThreeArrowChartMarks(fullQuotes){
    return fullQuotes.filter((q) => {
        return q.is3ArrowGreenPositive === true;
    }).map((q, i) => {
        return formatThreeArrowChartMark(q, i);
    });
}

function getGapChartMarks(fullQuotes) {
   return fullQuotes.filter((q,i,qts) => {
        let diffCriteria = getDiffAmount(q);
        let diffCriteriaPercent = q.close * .10;
        if(i > 0) {
            let diffBetweenCurrentPreviousClose = Math.abs((q.close - qts[i-1].close));
            let diffBetweenCurrentOpenPreviousClose = Math.abs((q.open - qts[i-1].close));
            return ((diffBetweenCurrentPreviousClose > diffCriteria) || (diffBetweenCurrentPreviousClose >= diffCriteriaPercent)) &&
                ((diffBetweenCurrentOpenPreviousClose > diffCriteria) || (diffBetweenCurrentOpenPreviousClose >= diffCriteriaPercent));
        }
        return false;
    }).map((q, i) => {
        return formatGapChartMark(q,i);
    });
}


function formatSignals(quote, index, typeName, typeId){
    return {
        id:index,
        date: quote.date,
        time:quote.timeStampDate,
        typeName: typeName,
        typeId: typeId,
        open: quote.open,
        close: quote.close,
        high: quote.high,
        low: quote.low,
        histogram: quote.histogram,
        stochasticsK: quote.stochasticsK,
        SMA10: quote.SMA10
    }
}

function formatGapChartMark(quote, index){
    return {
        id:index,
        time:quote.timeStampDate,
        color:"blue",
        text:"Gap",
        label:"G",
        labelFontColor:"black",
        minSize:20
    }
}

function formatThreeArrowChartMark(quote, index){
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

function mergeSignalsAndSortByTime(signalsSet1, signalsSet2 ){
    let mergedSignals = signalsSet1.concat(signalsSet2);

    return _.sortBy(mergedSignals, [function(o) { return o.time; }]);
}

function formatMarksResult(signals){
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

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
});



module.exports = { app };

let tradingViewConfig = `{
    "supports_search": true,
        "supports_group_request": false,
        "supports_marks": true,
        "supports_timescale_marks": false,
        "supports_time": true,
        "exchanges": [
        {
            "value": "",
            "name": "All Exchanges",
            "desc": ""
        },
        {
            "value": "XETRA",
            "name": "XETRA",
            "desc": "XETRA"
        },
        {
            "value": "NSE",
            "name": "NSE",
            "desc": "NSE"
        },
        {
            "value": "NasdaqNM",
            "name": "NasdaqNM",
            "desc": "NasdaqNM"
        },
        {
            "value": "NYSE",
            "name": "NYSE",
            "desc": "NYSE"
        },
        {
            "value": "CDNX",
            "name": "CDNX",
            "desc": "CDNX"
        },
        {
            "value": "Stuttgart",
            "name": "Stuttgart",
            "desc": "Stuttgart"
        }
    ],
        "symbolsTypes": [
        {
            "name": "All types",
            "value": ""
        },
        {
            "name": "Stock",
            "value": "stock"
        },
        {
            "name": "Index",
            "value": "index"
        }
    ],
        "supportedResolutions": [
        "D",
        "2D",
        "3D",
        "W",
        "3W",
        "M",
        "6M"
    ]
}`;
