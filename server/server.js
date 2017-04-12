var express = require('express');
var bodyParser = require('body-parser');
var quotes = require('./services/quotes.jobs');
var cors = require('cors');
var querystring = require('querystring');
const _ = require('lodash-node');

var { StockQuote } = require('./models/stockQuote');
var quotes = require('./services/quotes.jobs');
const axios = require('axios');
const historyQuotes = 'https://demo_feed.tradingview.com/history';
const symbolsQuotes = 'https://demo_feed.tradingview.com/symbols';
const marksQuotes = 'https://demo_feed.tradingview.com/marks';
const timescale_marksQuotes = 'https://demo_feed.tradingview.com/timescale_marks';
const configQuotes = 'https://demo_feed.tradingview.com/config';


var app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

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
    // axios.get(configQuotes).then(function(data) {
    //     res.send(data.data)
    // }).catch(function(err){
    //     res.send(err)
    // });
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
    let from = new Date(req.query.from);
    let to = new Date(req.query.to);
    quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

        //3 arrows signals
        let signals = fullQuotes.filter((q) => {
           return q.is3ArrowGreenPositive === true;
        }).map((q, i) => {
            return {
                id:i,
                time:q.timeStampDate,
                color:"green",
                text:"3 Green Arrows",
                label:"^",
                labelFontColor:"black",
                minSize:20
            }
        });


        let gapSignals = fullQuotes.filter((q,i,qts) => {
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
             return {
                 id:i,
                 time:q.timeStampDate,
                 color:"blue",
                 text:"Gap",
                 label:"G",
                 labelFontColor:"black",
                 minSize:20
             }
         });

        let mergedSignals = gapSignals.concat(signals);

            mergedSignals = _.sortBy(mergedSignals, [function(o) { return o.time; }]);

            let marks = {
                id: _.pluck(mergedSignals, 'id'),
                time: _.pluck(mergedSignals, 'time'),
                color: _.pluck(mergedSignals, 'color'),
                text: _.pluck(mergedSignals, 'text'),
                label: _.pluck(mergedSignals, 'label'),
                labelFontColor: _.pluck(mergedSignals, 'labelFontColor'),
                minSize: _.pluck(mergedSignals, 'minSize')
            };
            res.send(marks);
        })
        .catch((error) => {
            console.log(error);
        });

    // let symbol = req.query.symbol;
    // let resolution = req.query.resolution;
    // let from = req.query.from;
    // let to = req.query.to;
    //
    // axios.get(marksQuotes, {
    //     params: {
    //         symbol: symbol, resolution: resolution, from: from, tom: to
    //     }
    // }).then(function(data) {
    //     res.send(data.data)
    // }).catch(function(err){
    //     res.send(err)
    // });
});

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

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
});

module.exports = { app };

let tradingViewConfig = `{
    "supports_search": true,
        "supports_group_request": false,
        "supports_marks": true,
        "supports_timescale_marks": true,
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
