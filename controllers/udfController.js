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
        let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        let to = moment.unix(req.query.to).format("MM/DD/YYYY");
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

    let getMarksGreenArrows = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        let to = moment.unix(req.query.to).format("MM/DD/YYYY");
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
        let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        let to = moment.unix(req.query.to).format("MM/DD/YYYY");
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
        let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        let to = moment.unix(req.query.to).format("MM/DD/YYYY");
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
        getMarks: getMarks,
        getSignals: getSignals,
        getMarksGreenArrows: getMarksGreenArrows,
        getSymbols: getSymbols,
        getTimescaleMarks: getTimescaleMarks
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