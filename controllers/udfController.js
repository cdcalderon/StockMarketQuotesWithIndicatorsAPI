let udfController = (
    axios,
    quotes,
    moment,
    gapValidatorUtils,
    charMarkUtils,
    threeArrowValidatorUtils,
    stockSignalsUtils) => {

    // const historyQuotesUrl = 'http://localhost:4600/api/udf/history';
    // const symbolsQuotesUrl  = 'http://localhost:4600/api/udf/symbols';

    const historyQuotesUrl = 'https://enigmatic-waters-56889.herokuapp.com/api/udf/history';
    const symbolsQuotesUrl = 'https://enigmatic-waters-56889.herokuapp.com/api/udf/symbols';
    const timescale_marksQuotesUrl = 'https://demo_feed.tradingview.com/timescale_marks';

    //Implement new yahoo UDP quotes service
    //https://github.com/tradingview/yahoo_datafeed/blob/master/yahoo.js
     let getHistory = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = req.query.from;
        let to = req.query.to;

        axios.get(historyQuotesUrl, {
            params: {
                symbol: symbol, resolution: resolution, from: from, to: to
            }
        }).then(function(data) {
            res.send(data.data)
        }).catch(function(err){
            res.send(err)
        });
    };

    let getMarksGaps = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        // let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        // let to = moment.unix(req.query.to).format("MM/DD/YYYY");
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);
                let marks = charMarkUtils.formatMarksResult(gapSignals);

                res.send(marks);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let getHistoricalGaps = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        // let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        // let to = moment.unix(req.query.to).format("MM/DD/YYYY");
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);

                res.send(gapSignals);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let getMarksGapWithPreviousQuote = (req, res) => {
        let symbol = req.query.symbol;
        let from = req.query.from;
        let to = req.query.to;
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);
                gapSignals = gapSignals.map((q, i, arr) => {
                    let previousLow = q.previousQuote.low;
                    let currentHigh = q.high;
                    let currentLow = q.low;
                    let currentOpen = q.open;

                    let previousHigh = q.previousQuote.high;

                    return {
                        high: q.high,
                        low: q.low,
                        direction: q.direction,
                        gapSize:q.gapSize,
                        signalDate: q.time,
                        drawExtensionDate: Math.floor(new Date(q.time * 1000) / 1000 + 4 * 30 * 24 * 60 * 60),
                        projection382: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.382),
                        projection50: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.5),
                        projection618: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.618),
                        projection100: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 1),
                        projection1618: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 1.618),
                        retracement382: getFibonacciRetracement(q.direction, previousLow, currentHigh, previousHigh, 0.382),
                        retracement50: getFibonacciRetracement(q.direction, previousLow, currentHigh, previousHigh, 0.5),
                        retracement618: getFibonacciRetracement(q.direction, previousLow, currentHigh, previousHigh, 0.618),
                        retracement100: getFibonacciRetracement(q.direction, previousLow, currentHigh, previousHigh, 1),
                        retracement1618: getFibonacciRetracement(q.direction, previousLow, currentHigh, previousHigh, 1.618),
                    }

                });
                res.send(gapSignals);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let getFibonacciProjection = (direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, fibPercentage) => {
        let projection = 0;

        if (direction === 'up') {
            projection = ((currentHigh - previousLow) * fibPercentage) + currentLow;
        } else if (direction === 'down') {
            projection = Math.abs(currentOpen - ((previousHigh - currentLow) * fibPercentage));
        }

        return projection;
    };

    let getFibonacciRetracement = (direction, previousLow, currentHigh, currentLow, previousHigh, fibPercentage) => {
        let retracement = 0;

        if (direction === 'up') {
            retracement = currentHigh - ((currentHigh - previousLow) * fibPercentage);
        } else if(direction === 'down'){
            retracement = Math.abs(currentLow + ((previousHigh - currentLow) * fibPercentage));
        }

        return retracement;
    };

    let getMarksGreenArrows = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {

                let threeArrowSignals = threeArrowValidatorUtils.getThreeArrowChartMarks(fullQuotes);

                let marks = charMarkUtils.formatMarksResult(threeArrowSignals);

                res.send(marks);
            })
            .catch((error) => {
                console.log(error);
            });
    };


    let getMarks = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {

                let threeArrowSignals = threeArrowValidatorUtils.getThreeArrowChartMarks(fullQuotes);

                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);

                let mergedSignals = stockSignalsUtils.mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

                let marks = charMarkUtils.formatMarksResult(mergedSignals);

                res.send(marks);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let getSignals = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {

                let threeArrowSignals = threeArrowValidatorUtils.getThreeArrowSignals(fullQuotes);

                let gapSignals = gapValidatorUtils.getGapSignals(fullQuotes);

                let mergedSignals = stockSignalsUtils.mergeSignalsAndSortByTime(gapSignals, threeArrowSignals);

                res.send(mergedSignals);
            })
            .catch((error) => {
                console.log(error);
            });

    };

    let getConfig = (req, res) => {
        res.send(tradingViewConfig);
    };

    let getSymbols = (req, res) => {
        let symbol = req.query.symbol;

        axios.get(symbolsQuotesUrl, {
            params: {
                symbol: symbol
            }
        }).then(function(data) {
            res.send(data.data)
        }).catch(function(err){
            res.send(err)
        });
    };

    let getTimescaleMarks = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = new Date(req.query.from);
        let to = new Date(req.query.to);

        axios.get(timescale_marksQuotesUrl, {
            params: {
                symbol: symbol, resolution: resolution, from: from, tom: to
            }
        }).then(function(data) {
            res.send(data.data)
        }).catch(function(err){
            res.send(err)
        });
    };

    return {
        getHistory: getHistory,
        getConfig: getConfig,
        getMarksGaps: getMarksGaps,
        getHistoricalGaps: getHistoricalGaps,
        getMarks: getMarks,
        getSignals: getSignals,
        getMarksGreenArrows: getMarksGreenArrows,
        getSymbols: getSymbols,
        getTimescaleMarks: getTimescaleMarks,
        getMarksGapWithPreviousQuote: getMarksGapWithPreviousQuote
    }

}

module.exports = udfController;

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
            "name": "Stock",
            "value": "stock"
        }
    ],
        "supportedResolutions": [
        "D"
    ]
}`;