const stockMarketQuotesService = require('../server/common/stockMarketQuotesService');
const quotesService = require('../server/services/quote.service');
const quotesStoch307Signals = require('../server/services/quotes.signals.stoch307');
const chalk = require('chalk');
const log = console.log;

let signalsDataFeedController = () => {

    let pupulateAllSignalsForAllSymbols = (req, res) => {
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

                    quotesService.populateGapSignals(from, to, stock.value)
                        .then((result) => {
                            log(chalk.blue(`Populate Gap Signal response::  ${result}` ));
                        });

                    quotesStoch307Signals.postStoch307BullSignalsForAllSymbols(from, to, stock.value)
                        .then((result) => {
                            log(chalk.yellow(`Populate Stoch307 response::  ${result}` ));

                        });
                    quotesService.populateThreeArrowSignal(from, to, stock.value)
                        .then((result) => {
                            log(chalk.green(`Populate ThreeArrow Signal response::  ${result}` ));
                        });

                    stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        console.log("Done with GapSignals");
                        res.send("OK");
                    }
                },1000);
            });
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }

    return {
        pupulateAllSignalsForAllSymbols: pupulateAllSignalsForAllSymbols
    }

};

module.exports = signalsDataFeedController;