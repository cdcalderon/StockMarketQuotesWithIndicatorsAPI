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

                // allStocks = allStocks.filter((q) => {
                //     return q.symbol === 'AAPL';
                // });

                console.log(`Got: ${allStocks}`);

                let generatedSymbols = genSymbols(allStocks);
               // let stock = generatedSymbols.next();

                let intervalGapId = setInterval(() => {
                    let stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        setTimeout(() => {
                            log(chalk.black.bgCyan.bold("Done Populating Signals for all Symbols"));
                            res.send("Ok");
                        }, 2000);

                    } else {
                        log(chalk.gray.bgMagenta.bold("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Current Symbol " + stock.value.symbol + "  @@@@@@@@@@@@@@@@@@@@@@@@@@@"));
                        quotesService.getHistoricalQuotes(stock.value.symbol, from, to)
                            .then((fullQuotes) => {
                                quotesService.populateGapSignalsFromQuotes(stock.value, fullQuotes)
                                    .then((result) => {
                                        log(chalk.blue(`Populate Gap Signal response::  ${result}` ));
                                    });
                                quotesService.populateThreeArrowSignalFromQuotes(stock.value, fullQuotes)
                                    .then((result) => {
                                        log(chalk.green(`Populate ThreeArrow Signal response::  ${result}` ));
                                    });
                                quotesStoch307Signals.postStoch307BullSignalsForAllSymbolsFromQuotes(stock.value, fullQuotes)
                                    .then((result) => {
                                        log(chalk.yellow(`Populate Stoch307 response::  ${result}` ));

                                    });

                            });

                    }
                },200);
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