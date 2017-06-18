const indicatorsUtils = require('../common/indicatorsUtils');
const { ThreeArrowSignal } = require('../models/threeArrowSignal');
const { GapSignal} = require('../models/gapSignal');
const moment = require('moment');
const quotesService = require('../common/stockMarketQuotesService');
const gapValidatorService = require('../common/gapValidatorUtils');

let getHistoricalQuotes = (symbol, from, to, resolve, reject) => {
    return Promise.resolve(quotesService.getHistoricalQuotes(symbol,from,to,resolve, reject));
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

let populateThreeArrowSignal = (from, to, symbol) => {
    return getHistoricalQuotes(symbol, from, to)
        .then(getIndicators)
        .then(createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {

            fullQuotes = fullQuotes.filter((q) => {
                return q.is3ArrowGreenPositive === true;
            });

            for(quote of fullQuotes) {

                let sQuote = new ThreeArrowSignal({
                    symbol:symbol,
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
                });

                sQuote.save().then((doc) => {
                    console.log('success saving.. : ', doc);
                }, (e) => {
                    console.log('error saving.. : ', e);
                });

            }

            return 1;
        });
};

let populateGapSignals = (from, to, symbol) => {
    return getHistoricalQuotes(symbol, from, to)
        .then((fullQuotes) => {

            let gapSignals = gapValidatorService.getGapSignals(fullQuotes);

            // fullQuotes = fullQuotes.filter((q) => {
            //     return q.is3ArrowGreenPositive === true;
            // });

            for(quote of gapSignals) {

                let sQuote = new GapSignal({
                    symbol:symbol,
                    dateStr: quote.date,
                    open: quote.open,
                    high: quote.high,
                    low: quote.low,
                    close: quote.close,
                    gapSize: quote.gapSize,
                    previousClose: quote.previousClose,
                    direction: quote.direction
                });

                sQuote.save().then((doc) => {
                    console.log('success saving.. : ', doc);
                }, (e) => {
                    console.log('error saving.. : ', e);
                });

            }

            return 1;
        });
};


module.exports = {
    getHistoricalQuotes,
    getIndicators,
    createQuotesWithIndicatorsAndArrowSignals,
    populateThreeArrowSignal,
    populateGapSignals
};