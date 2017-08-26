let udfController = (
    axios,
    quotes,
    moment,
    _,
    gapValidatorUtils,
    charMarkUtils,
    threeArrowValidatorUtils,
    stockSignalsUtils,
    quotesStoch307SignalsService,
    GapSignal) => {

     //const historyQuotesUrl = 'http://localhost:4600/api/udf/history';
    // const symbolsQuotesUrl  = 'http://localhost:4600/api/udf/symbols';

    const historyQuotesUrl = 'https://enigmatic-waters-56889.herokuapp.com/api/udf/history';
    const symbolsQuotesUrl = 'https://enigmatic-waters-56889.herokuapp.com/api/udf/symbols';
    const timescale_marksQuotesUrl = 'https://demo_feed.tradingview.com/timescale_marks';

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

        GapSignal.find({
            $and: [{dateId: {$gte: req.query.from, $lte: req.query.to}}, {symbol: symbol}]

        }).then((gaps)=> {
            let marks = gaps.map((q, i) => {
                q._doc.timeStampDate = q._doc.dateId;
                q._doc.previousQuote = q._doc.previousClose;
                return charMarkUtils.formatGapChartMark(q._doc,i);
            });

             marks = charMarkUtils.formatMarksResult(marks);
            res.send(marks);
        });
    };

    let getHistoricalGaps = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from;
        let to;
        if((parseInt(req.query.from, 10) >10000)) {
            from = new Date(req.query.from * 1000);
            to = new Date(req.query.to * 1000);
        } else {
            from = req.query.from;
            to = req.query.to;
        }

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

    let getStoch307BullMarks = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);

        from = quotesStoch307SignalsService.addMonth(from, -1); // needed because of 30 day  mavg

        quotesStoch307SignalsService.getStoch307SignalsBull(symbol, from, to)
            .then((stoch307SignalQuotes) => {

                let marks = charMarkUtils.formatStoch307ChartMarks(stoch307SignalQuotes);
                marks = charMarkUtils.formatMarksResult(marks);
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
        getMarksGreenArrows: getMarksGreenArrows,
        getStoch307BullMarks:getStoch307BullMarks,
        getHistoricalGaps: getHistoricalGaps,
        getMarks: getMarks,
        getSignals: getSignals,
        getSymbols: getSymbols,
        getTimescaleMarks: getTimescaleMarks
    }

};

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