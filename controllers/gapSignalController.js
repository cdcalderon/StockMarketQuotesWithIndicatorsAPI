const filterComposer = require('../server/common/filterComposerUtils');
const stockMarketQuotesService = require('../server/common/stockMarketQuotesService');

let gapSignalController = (GapSignal, quotes) => {

    let post = (req, res) => {
        let symbols = req.body.params.symbols;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        let generatedSymbols = genSymbols(symbols);
        let symbol = generatedSymbols.next();

        let intervalGapId = setInterval(() => {
            console.log("Current Symbol" + symbol.value);

            quotes.populateGapSignals(from, to, symbol.value)
                .then((result) => {
                    console.log(`about to send response::  ${result}` );
                });

            symbol = generatedSymbols.next();

            if(symbol.done === true){
                clearInterval(intervalGapId);
                console.log("Done with GapSignals");
                res.send("OK");
            }

        },7500);

    };

    let postGapSignalsForAllSymbols = (req, res) => {
        // let from = new Date(req.body.params.from);
        // let to = new Date(req.body.params.to);
        let from = '2015-01-01';
        let to = new Date();
        stockMarketQuotesService.getAllStocks()
            .then(function(stocks) {
                let allStocks = stocks.data;
                console.log(`Got: ${allStocks}`);

                let generatedSymbols = genSymbols(allStocks);
                let stock = generatedSymbols.next();

                let intervalGapId = setInterval(() => {
                    console.log("Current Symbol" + stock.value.symbol);

                    quotes.populateGapSignals(from, to, stock.value)
                        .then((result) => {
                            console.log(`about to send response::  ${result}` );
                        });

                    stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        console.log("Done with GapSignals");
                        res.send("OK");
                    }
                },5000);
            });
    };

    let getGaps = (req, res) => {
        let pagingInfo = req.body.pagingInfo;
        let from = req.body.from;
        let to = req.body.to;

        let bodyQuery = req.body.query;
        let filterQuery = {};

        filterComposer.addDateRangeFilter(filterQuery, from, to);

        if(!bodyQuery.symbols || (bodyQuery.symbols && bodyQuery.symbols.length === 0)) {
            if(bodyQuery.marketCaps && bodyQuery.marketCaps.length > 0) {
                filterComposer.addMarketCapFilter(filterQuery, bodyQuery.marketCaps);
            }

            if(bodyQuery.exchanges) {
                filterComposer.addExchangeFilter(filterQuery, bodyQuery.exchanges);
            }
        } else {
            filterComposer.addSymbolsFilter(filterQuery, bodyQuery.symbols);
        }

        let paginationOptions = filterComposer.getPaginationOptions(pagingInfo);

        GapSignal.paginate(filterQuery, paginationOptions, function(err, result) {
            res.send(result)
        });
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }


        return {
        post: post,
        getGaps: getGaps,
        postGapSignalsForAllSymbols: postGapSignalsForAllSymbols
    }

};

module.exports = gapSignalController;