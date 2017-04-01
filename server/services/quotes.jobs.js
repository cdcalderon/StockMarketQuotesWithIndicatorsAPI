const indicatorsUtils = require('../common/indicatorsUtils');

let getHistoricalQuotes = (symbol, from, to, resolve, reject) => {
    return Promise.resolve(indicatorsUtils.getHistoricalQuotes(symbol,from,to,resolve, reject));
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

module.exports = {
    getHistoricalQuotes,
    getIndicators,
    createQuotesWithIndicatorsAndArrowSignals
};