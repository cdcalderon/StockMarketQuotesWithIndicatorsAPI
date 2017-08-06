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

        },100);
    };

    let postThreeArrowSignalsForAllSymbols = (req, res) => {
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

                },200);
            });
    };

    let getThreeArrowSignals = (req, res) => {
        let query = filterComposer.getFilterQuery(req.body);

        ThreeArrowSignal.paginate(query.filterQuery, query.paginationOptions, function(err, result) {
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