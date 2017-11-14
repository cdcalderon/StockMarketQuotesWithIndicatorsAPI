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

        },100);

    };

    let postGapSignalsForAllSymbols = (req, res) => {
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
                },200);
            });
    };

    let getGaps = (req, res) => {
        let query = filterComposer.getFilterQuery(req.body);

        GapSignal.paginate(query.filterQuery, query.paginationOptions, function(err, result) {
            res.send(result)
        });
    };

    let getTopCompanyGaps = (req, res) => {
        let symbols = ['AAPL', 'AMZN', 'AVGO', 'AXP'];
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
        GapSignal.find(query)
            .then((gaps => {
                    console.log(gaps);
                    let topGaps = gaps.map((g) => {
                        return {
                            symbol: g._doc.symbol,
                            dateStr: g._doc.dateStr,
                            dateNumberic: g._doc.dateId,
                            signalType: 'Gap'
                        }
                    });
                    res.send(topGaps);
            }));
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }
        return {
        post: post,
        getGaps: getGaps,
        postGapSignalsForAllSymbols: postGapSignalsForAllSymbols,
        getTopCompanyGaps: getTopCompanyGaps
    }

};

module.exports = gapSignalController;