const axios = require('axios');

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
        getAllStocks()
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
        let symbol = req.body.symbol;
        let from = req.body.from;
        let to = req.body.to;



        let dateF = {dateId: {$gte: from, $lte: to}};
        GapSignal.find(dateF).sort([['dateId', 'ascending']]).then((signals) => {
            res.send(signals)
        });
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }

    let getAllStocks = () => {
        const baseHerokuUdpUrl = 'https://enigmatic-waters-56889.herokuapp.com';
        const getAllSymbols = '/api/udf/allstocksfull';
        return axios.get(`${baseHerokuUdpUrl}${getAllSymbols}`);
    };

    return {
        post: post,
        getGaps: getGaps,
        postGapSignalsForAllSymbols: postGapSignalsForAllSymbols
    }

}

module.exports = gapSignalController;