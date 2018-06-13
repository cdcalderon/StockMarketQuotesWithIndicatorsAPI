const indicatorsUtils = require('../common/indicatorsUtils');
const { ThreeArrowSignal } = require('../models/threeArrowSignal');
const { GapSignal} = require('../models/gapSignal');
const quotesService = require('../common/stockMarketQuotesService');
const gapValidatorService = require('../common/gapValidatorUtils');
const chalk = require('chalk');
const log = console.log;
const dateUtils = require('../common/dateUtils');


let getHistoricalQuotes = (symbol, from, to) => {
    return  quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
        return new Promise((resolve, reject) => {
            if(yQuotes) {
                resolve(yQuotes);
            } else{
                reject('Error : could not find any quotes');
            }
        });

    });

    // return quotesService.getHistoricalQuotesQuand(symbol,from,to).then((quotes) => {
    //     if(isQuand(quotes) && quotes.data.dataset.data.length > 0) {
    //         return new Promise((resolve) => {
    //             resolve(formatQuandQuotes(quotes));
    //         });
    //     } else {
    //         return quotesService.getHistoricalQuotesGoogle(symbol, from, to).then((gQuotes) => {
    //             if(gQuotes && gQuotes.length > 0) {
    //                 return new Promise((resolve) => {
    //                     resolve(gQuotes);
    //                 });
    //             } else {
    //                 return quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
    //                     return new Promise((resolve, reject) => {
    //                         if(yQuotes && yQuotes.length > 0) {
    //                             resolve(gQuotes);
    //                         } else{
    //                             reject('Error : could not find any quotes');
    //                         }
    //                     });
    //
    //                 })
    //             }
    //         })
    //     }
    // }, (error) => {
    //     if(error) {
    //         return quotesService.getHistoricalQuotesGoogle(symbol, from, to).then((gQuotes) => {
    //             if(gQuotes) {
    //                 return new Promise((resolve) => {
    //                     resolve(gQuotes);
    //                 });
    //             } else {
    //                 return quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
    //                     return new Promise((resolve, reject) => {
    //                         if(yQuotes) {
    //                             resolve(gQuotes);
    //                         } else{
    //                             reject('Error : could not find any quotes');
    //                         }
    //                     });
    //
    //                 })
    //             }
    //         }, (error) => {
    //             if(error) {
    //                 return  quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
    //                     return new Promise((resolve, reject) => {
    //                         if(yQuotes) {
    //                             resolve(yQuotes);
    //                         } else{
    //                             reject('Error : could not find any quotes');
    //                         }
    //                     });
    //
    //                 })
    //             }
    //         })
    //     }
    // });
};

let getIndicators = (quotes) => {
  return Promise.all([getMACDWithSMAS(quotes), getSTOCHs(quotes)]);
};

let getIndicatorsForStoch307For307Signal = (quotes) => {
    return Promise.all([getMACDWithSMASForStoch307Signal(quotes), getSTOCHsForStoch307Signal(quotes)]);
};


let getMACDWithSMAS = (quotes) => {
    let { highs, closes } = indicatorsUtils.getHLC(quotes);
    let smas = indicatorsUtils.getSMAs(10, closes);
    let macds = indicatorsUtils.getMACDs(closes, 8, 17, 9, true, true);
    return Promise.resolve({quotes: quotes, smas: smas, macds: macds});
};

let getSTOCHs = (quotes) => {
    let { highs, lows, closes } = indicatorsUtils.getHLC(quotes);
    let endIndex = highs.length -1;
    let stochsInput = {
        name: "STOCH",
        optInSlowK_Period: 5,
        optInFastK_Period: 14,
        optInSlowK_MAType: 0,
        optInSlowD_Period: 5,
        optInSlowD_MAType: 0,
        startIdx: 0,
        endIdx: endIndex,
        high: highs,
        low: lows,
        close: closes,
    };

    return new Promise((resolve, reject) => {
        indicatorsUtils.getSTOCHs(stochsInput,resolve,reject);
    });
};

let getMACDWithSMASForStoch307Signal = (quotes) => {
    let { highs, closes } = indicatorsUtils.getHLC(quotes);
    let xmas7 = indicatorsUtils.getEMAs(7, closes);
    let xmas30 = indicatorsUtils.getEMAs(30, closes);
    let macds = indicatorsUtils.getMACDs(closes, 8, 17, 9, true, true);
    return Promise.resolve({quotes: quotes, xmas: {xmas7: xmas7, xmas30: xmas30}, macds: macds});
};

let getSTOCHsForStoch307Signal = (quotes) => {
    let { highs, lows, closes } = indicatorsUtils.getHLC(quotes);
    let endIndex = highs.length -1;
    let stochsInput = {
        name: "STOCH",
        optInSlowK_Period: 1,
        optInFastK_Period: 10,
        optInSlowK_MAType: 0,
        optInSlowD_Period: 1,
        optInSlowD_MAType: 0,
        startIdx: 0,
        endIdx: endIndex,
        high: highs,
        low: lows,
        close: closes,
    };

    return new Promise((resolve, reject) => {
        indicatorsUtils.getSTOCHs(stochsInput,resolve,reject);
    });
};

let createQuotesWithIndicatorsAndArrowSignals = (indicators) => {
    let macdSmasQuotes = indicators[0];
    let stochs = indicators[1];

  return Promise.resolve(indicatorsUtils.createQuotesWithIndicatorsAndArrowSignals(
      macdSmasQuotes.quotes,
      macdSmasQuotes.smas,
      macdSmasQuotes.macds,
      stochs));
};

let populateThreeArrowSignal = (from, to, stock) => {
    return getHistoricalQuotes(stock.symbol, from, to)
        .then(getIndicators)
        .then(createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            fullQuotes = fullQuotes.filter((q) => {
                return q.is3ArrowGreenPositive === true;
            });

            for(let quote of fullQuotes) {

                ThreeArrowSignal.find({
                    symbol: stock.symbol,
                    dateId: new Date(quote.date) / 1000})
                    .then((threeArrowSignals => {
                        if (threeArrowSignals.length === 0) {
                            let sQuote = new ThreeArrowSignal({
                                symbol: stock.symbol,
                                dateStr: quote.date,
                                open: quote.open,
                                high: quote.high,
                                low: quote.low,
                                close: quote.close,
                                movingAvg10: quote.SMA10,
                                stochasticsK: quote.stochasticsK,
                                stochasticsD: quote.stochasticsD,
                                macdHistogram: quote.histogram,
                                isGreenArrow: quote.is3ArrowGreenPositive,
                                dateId: new Date(quote.date) / 1000,
                                exchange: stock.exchange,
                                summaryQuoteUrl: stock.summaryQuoteUrl,
                                industry: stock.industry,
                                sector: stock.sector,
                                name: stock.name,
                                marketCapNumeric: stock.marketCapNumeric,
                                marketCap: stock.marketCap
                            });

                            sQuote.save().then((doc) => {
                                log(chalk.green('success saving.. : ', doc));
                            }, (e) => {
                                log(chalk.red('error saving.. : '), e);
                            });
                        } else {
                            log(chalk.green(`Three Arrow Signal already on DB symbol ${stock.symbol}`));
                        }
                    }));
            }

            return 1;
        });
};

let populateThreeArrowSignalFromQuotes = (stock, fullQuotes) => {
    return new Promise((resolve, reject) => {
            return getIndicators(fullQuotes)
            .then(createQuotesWithIndicatorsAndArrowSignals)
            .then((signals) => {

                let validatedSignals = signals.filter((q) => {
                    return q.is3ArrowGreenPositive === true;
                });

                for(let signal of validatedSignals) {
                    let dateTimeStamp = dateUtils.getGenericTimeStampDate(signal.date);
                    ThreeArrowSignal.find({
                        symbol: stock.symbol,
                        dateId: dateTimeStamp})
                        .then((threeArrowSignals => {
                            if (threeArrowSignals.length === 0) {
                                let sQuote = new ThreeArrowSignal({
                                    symbol: stock.symbol,
                                    dateStr: signal.date,
                                    open: signal.open,
                                    high: signal.high,
                                    low: signal.low,
                                    close: signal.close,
                                    movingAvg10: signal.SMA10,
                                    stochasticsK: signal.stochasticsK,
                                    stochasticsD: signal.stochasticsD,
                                    macdHistogram: signal.histogram,
                                    isGreenArrow: signal.is3ArrowGreenPositive,
                                    dateId: dateTimeStamp,
                                    exchange: stock.exchange,
                                    summaryQuoteUrl: stock.summaryQuoteUrl,
                                    industry: stock.industry,
                                    sector: stock.sector,
                                    name: stock.name,
                                    marketCapNumeric: stock.marketCapNumeric,
                                    marketCap: stock.marketCap
                                });

                                sQuote.save().then((doc) => {
                                    log(chalk.gray.bgGreen.bold('success saving.. : ', doc));
                                    resolve("Ok saving threearrow");
                                }, (e) => {
                                    log(chalk.red('error saving.. : '), e);
                                    reject("Error saving threearrow");
                                });
                            } else {
                                log(chalk.gray.bgGreen.bold(`Three Arrow Signal already on DB symbol ${chalk.magenta(stock.symbol)}`));
                                resolve("Threearrow exists");
                            }
                        }));
                }

            })
                .catch((error) => {
                    log(chalk.red(error));
                    reject(`Error saving Threearrow ${error}`);
                });
    });
};

let populateGapSignals = (from, to, stock) => {
    return getHistoricalQuotes(stock.symbol, from, to)
        .then((fullQuotes) => {
            let gapSignals = gapValidatorService.getGapSignals(fullQuotes);
            for(let quote of gapSignals) {

                GapSignal.find({
                    symbol: stock.symbol,
                    dateId: new Date(quote.date) / 1000})
                    .then((gaps => {
                        if(gaps.length === 0) {
                            let sQuote = new GapSignal({
                                symbol: stock.symbol,
                                dateStr: quote.date,
                                open: quote.open,
                                high: quote.high,
                                low: quote.low,
                                close: quote.close,
                                gapSize: quote.gapSize,
                                previousClose: quote.previousClose,
                                direction: quote.direction,
                                dateId: new Date(quote.date) / 1000,
                                exchange: stock.exchange,
                                summaryQuoteUrl: stock.summaryQuoteUrl,
                                industry: stock.industry,
                                sector: stock.sector,
                                name: stock.name,
                                marketCapNumeric: stock.marketCapNumeric,
                                marketCap: stock.marketCap
                            });

                            sQuote.save().then((doc) => {
                                log(chalk.blue('success saving.. : ', doc));
                            }, (e) => {
                                log(chalk.blue(chalk.red('error saving.. : '), e));
                            });
                        } else {
                            log(chalk.blue(`Gap already on DB symbol ${stock.symbol}`));
                        }
                    }));

            }

            return 1;
        });
};

let populateGapSignalsFromQuotes = (stock, fullQuotes) => {
    return new Promise((resolve, reject) => {
        let gapSignals = gapValidatorService.getGapSignals(fullQuotes);
        for(let quote of gapSignals) {
            let dateTimeStamp = dateUtils.getGenericTimeStampDate(quote.date);
            GapSignal.find({
                symbol: stock.symbol,
                dateId: dateTimeStamp})
                .then((gaps => {
                    if(gaps.length === 0) {
                        let sQuote = new GapSignal({
                            symbol: stock.symbol,
                            dateStr: quote.date,
                            open: quote.open,
                            high: quote.high,
                            low: quote.low,
                            close: quote.close,
                            gapSize: quote.gapSize,
                            previousClose: quote.previousClose,
                            direction: quote.direction,
                            dateId: dateTimeStamp,
                            exchange: stock.exchange,
                            summaryQuoteUrl: stock.summaryQuoteUrl,
                            industry: stock.industry,
                            sector: stock.sector,
                            name: stock.name,
                            marketCapNumeric: stock.marketCapNumeric,
                            marketCap: stock.marketCap
                        });

                        sQuote.save().then((doc) => {
                            log(chalk.gray.bgBlue.bold('success saving.. : ', doc));
                            resolve("Ok saving gap");
                        }, (e) => {
                            log(chalk.gray.bgBlue.bold(chalk.red('error saving.. : '), e));
                            reject("error saving gap");
                        });
                    } else {
                        log(chalk.gray.bgBlue.bold(`Gap already on DB symbol ${chalk.cyan(stock.symbol)}`));
                        resolve("Gap exists");
                    }
                }));

        }
    });

};

let populateGapSignalsAllSymbols = (from, to, symbols) => {
    for (let symbol of symbols) {
        console.log(symbol, from, to);
        getHistoricalQuotes(symbol, from, to)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorService.getGapSignals(fullQuotes);

                console.log(fullQuotes);
                for(let quote of gapSignals) {

                    GapSignal.find({
                        symbol: symbol,
                        dateId: new Date(quote.date.toDateString()) / 1000})
                        .count()
                        .then((count => {
                            if(count === 0) {
                                console.log(gap);
                            } else {
                                console.log(gap);
                            }
                        }));

                    // let sQuote = new GapSignal({
                    //     symbol:symbol,
                    //     dateStr: quote.date,
                    //     open: quote.open,
                    //     high: quote.high,
                    //     low: quote.low,
                    //     close: quote.close,
                    //     gapSize: quote.gapSize,
                    //     previousClose: quote.previousClose,
                    //     direction: quote.direction
                    // });
                    //
                    // sQuote.save().then((doc) => {
                    //     console.log('success saving.. : ', doc);
                    // }, (e) => {
                    //     console.log('error saving.. : ', e);
                    // });

                }
            });
    }
};

//TODO: Move private method to new file
let formatQuandQuotes = (quotes) => {
    if(isQuand(quotes)) {
        return quotes.data.dataset.data.map((q) => {
            return {
                symbol: quotes.data.dataset.dataset_code,
                date: q[0],
                open: q[1],
                high: q[2],
                low: q[3],
                close: q[4],
                volume: q[5]
            }
        }).reverse();
    }
};

let isQuand = (quotes) => {
    let isValid = quotes && quotes.data && quotes.data.dataset && quotes.data.dataset.data;
    return isValid;
};

module.exports = {
    getHistoricalQuotes,
    getIndicators,
    createQuotesWithIndicatorsAndArrowSignals,
    populateThreeArrowSignal,
    populateGapSignals,
    populateGapSignalsAllSymbols,
    getIndicatorsForStoch307For307Signal,
    populateGapSignalsFromQuotes,
    populateThreeArrowSignalFromQuotes

};