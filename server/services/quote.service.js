const indicatorsUtils = require('../common/indicatorsUtils');
const { ThreeArrowSignal } = require('../models/threeArrowSignal');
const { GapSignal} = require('../models/gapSignal');
const moment = require('moment');
const quotesService = require('../common/stockMarketQuotesService');
const gapValidatorService = require('../common/gapValidatorUtils');

let getHistoricalQuotes = (symbol, from, to, resolve, reject) => {
    return quotesService.getHistoricalQuotesQuand(symbol,from,to).then((quotes) => {
        if(isQuand(quotes) && quotes.data.dataset.data.length > 0) {
            return new Promise((resolve) => {
                resolve(formatQuandQuotes(quotes));
            });
        } else {
            return quotesService.getHistoricalQuotesGoogle(symbol, from, to).then((gQuotes) => {
                if(gQuotes && gQuotes.length > 0) {
                    return new Promise((resolve) => {
                        resolve(gQuotes);
                    });
                } else {
                    return quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
                        return new Promise((resolve, reject) => {
                            if(yQuotes && yQuotes.length > 0) {
                                resolve(gQuotes);
                            } else{
                                reject('Error : could not find any quotes');
                            }
                        });

                    })
                }
            })
        }
    }, (error) => {
        if(error) {
            return quotesService.getHistoricalQuotesGoogle(symbol, from, to).then((gQuotes) => {
                if(gQuotes) {
                    return new Promise((resolve) => {
                        resolve(gQuotes);
                    });
                } else {
                    return quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
                        return new Promise((resolve, reject) => {
                            if(yQuotes) {
                                resolve(gQuotes);
                            } else{
                                reject('Error : could not find any quotes');
                            }
                        });

                    })
                }
            }, (error) => {
                if(error) {
                    return  quotesService.getHistoricalQuotesYahoo(symbol, from, to).then((yQuotes) => {
                        return new Promise((resolve, reject) => {
                            if(yQuotes) {
                                resolve(gQuotes);
                            } else{
                                reject('Error : could not find any quotes');
                            }
                        });

                    })
                }
            })
        }
    });
};

let getIndicators = (quotes) => {
  return Promise.all([getMACDWithSMAS(quotes), getSTOCHs(quotes)]);
};

let getMACDWithSMAS = (quotes) => {
    let { highs, lows, closes } = indicatorsUtils.getHLC(quotes);
    let smas = indicatorsUtils.getSMAs(10, closes);
    let macds = indicatorsUtils.getMACDs(closes, 8, 17, 9, true, true);
    let endIndex = highs.length -1;

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
        indicatorsUtils.getSTOCHs("STOCH",5,14,0,5,0,0,endIndex,highs,lows, closes,resolve,reject);
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
                                name: stock.name
                            });

                            sQuote.save().then((doc) => {
                                console.log('success saving.. : ', doc);
                            }, (e) => {
                                console.log('error saving.. : ', e);
                            });
                        } else {
                            console.log(`Three Arrow Signal already on DB symbol ${stock.symbol}`);
                        }
                    }));
            }

            return 1;
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
                                name: stock.name
                            });

                            sQuote.save().then((doc) => {
                                console.log('success saving.. : ', doc);
                            }, (e) => {
                                console.log('error saving.. : ', e);
                            });
                        } else {
                            console.log(`Gap already on DB symbol ${stock.symbol}`);
                        }
                    }));

            }

            return 1;
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
    populateGapSignalsAllSymbols
};