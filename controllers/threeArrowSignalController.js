const filterComposer = require('../server/common/filterComposerUtils');
const stockMarketQuotesService = require('../server/common/stockMarketQuotesService');

let threeArrowSignalController = (ThreeArrowSignal, quotes) => {

    let post = (req, res) => {
        let symbols = req.body.params.symbols;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        let generatedSymbols = genSymbols(symbols);
        let symbol = generatedSymbols.next();

        let intervalGapId = setInterval(() => {
            console.log("Current Symbol" + symbol.value);

            quotes.populateThreeArrowSignal(from, to, symbol.value)
                .then((result) => {
                    console.log(`about to send response::  ${result}` );
                });

            symbol = generatedSymbols.next();

            if(symbol.done === true){
                clearInterval(intervalGapId);
                console.log("Done with Three Arrow Signals");
                res.send("OK");
            }

        },200);
    };

    let postThreeArrowSignalsForAllSymbols = (req, res) => {
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

                    quotes.populateThreeArrowSignal(from, to, stock.value)
                        .then((result) => {
                            console.log(`about to send response::  ${result}` );

                        });

                    stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        console.log("Done with Three Arrow Signals");
                        res.send("OK");
                    }

                },2000);
            });
    };

    let getThreeArrowSignals = (req, res) => {

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

        ThreeArrowSignal.paginate(filterQuery, paginationOptions, function(err, result) {
            res.send(result)
        });

    };


    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }

    return {
        post,
        getThreeArrowSignals,
        postThreeArrowSignalsForAllSymbols
    }

};

module.exports = threeArrowSignalController;