const quotesStoch307Signals = require('../server/services/quotes.signals.stoch307');
const filterComposer = require('../server/common/filterComposerUtils');
const stockMarketQuotesService = require('../server/common/stockMarketQuotesService');
const {Stoch307Signal} = require('../server/models/stoch307Signal');
const chalk = require('chalk');
const log = console.log;

let stoch307SignalController = (
    axios,
    quotes,
    moment,
    _) => {

    let getStoch307BullSignals = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);

        from = quotesStoch307Signals.addMonth(from, -1);
        quotesStoch307Signals.getStoch307SignalsBull(symbol, from, to)
            .then((fullQuotes) => {
                res.send(fullQuotes);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let postStoch307BullSignalsForAllSymbols = (req, res) => {
        let from = '2014-01-01';
        let to = new Date();

        stockMarketQuotesService.getAllStocks()
            .then(function(stocks) {
                let allStocks = stocks.data;
                console.log(`Got: ${allStocks}`);
                let generatedSymbols = genSymbols(allStocks);
                let stock = generatedSymbols.next();

                let intervalGapId = setInterval(() => {
                    console.log("Current Symbol" + stock.value.symbol);
                    quotesStoch307Signals.postStoch307BullSignalsForAllSymbols(from, to, stock.value)
                        .then((result) => {
                            console.log(`about to send response::  ${result}` );

                        });
                    stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        console.log("Done with Stoch 307 Signals");
                        res.send("OK");
                    }

                },200);
            });
    };

    let getStoch307BullSignalsWithFilter = (req, res) => {
        let query = filterComposer.getFilterQuery(req.body);



        Stoch307Signal.paginate(query.filterQuery, query.paginationOptions, function(err, result) {
            log(chalk.blue(`Populate Gap Signal response::  ${result}` ));
            res.send(result)
        });
    };

    let getTopCompanyStoch307 = (req, res) => {
        let symbols = ['IBM', 'ULTI', 'DPZ'];
        let from = 1483250400;
        let to = 1504242000;
        let query = {
            '$and': [
                {
                    symbol: {$in: symbols}
                },
                {
                    dateId: {$gte: from, $lte: to}
                }
            ]
        };
        Stoch307Signal.find(query)
            .then((gaps => {
                console.log(gaps);
                let topGaps = gaps.map((g) => {
                    return {
                        symbol: g._doc.symbol,
                        dateStr: moment(new Date(g._doc.dateId * 1000)).format('LL'),
                        dateNumberic: g._doc.dateId,
                        signalType: 'gap'
                    }
                });
                res.send(topGaps);
            }));
    };

    return {
        getStoch307BullSignals,
        postStoch307BullSignalsForAllSymbols,
        getStoch307BullSignalsWithFilter,
        getTopCompanyStoch307
    }

};

function *genSymbols(array) {
    for (let i = 0; i < array.length; i++) {
        yield array[i];
    }
}

module.exports = stoch307SignalController;