const stoch307SignalValidator = require('../common/stoch307ValidatorUtils');

let getStoch307Signals = (indicators) => {
    let macdSmasQuotes = indicators[0];
    let stochs = indicators[1];

    return Promise.resolve(createQuotes(
        macdSmasQuotes.quotes,
        macdSmasQuotes.xmas.xmas7,
        macdSmasQuotes.xmas.xmas30,
        macdSmasQuotes.macds,
        stochs));
};

let createQuotes= (quotes,xmas7,xmas30,macds,stochs ) => {
    let loadedQuotes = quotes.map((q, i, quotesArr) => {
        return {
            date: q.date,
            open: q.open,
            close: q.close,
            high: q.high,
            low: q.low,
            MACD: macds[i] ? macds[i].MACD : 0,
            MACDSignal: macds[i] ? macds[i].signal : 0,
            histogram: macds[i] ? macds[i].histogram : 0,
            stochasticsK: stochs.outSlowK[i] ? stochs.outSlowK[i] : undefined,
            stochasticsD: stochs.outSlowD[i] ? stochs.outSlowD[i] : undefined,
            XMA7: xmas7[i],
            XMA30: xmas30[i],
            EMA30PositiveSlope: stoch307SignalValidator.movingAvgPositiveSlope(5, i, xmas30),
            isXMA7CrossingUp: stoch307SignalValidator.isSMACrossingUp(quotesArr[i-1],xmas7[i-1],q.close,xmas7[i]),
            isMACDCrossingUp: stoch307SignalValidator.isMACDCrossingUp(macds[i-1],macds[i]),
            isSTOCHCrossingUp: stoch307SignalValidator.isSTOCHCrossingUp(stochs.outSlowK[i-1],
                stochs.outSlowK[i],
                stochs.outSlowD[i])
        }
    });

    let stoch307SignalQuotes =  loadedQuotes.map((s) => {
        let stoch307SignalConfirmation = { isvalid: s.EMA30PositiveSlope > 0 && s.isXMA7CrossingUp && s.isSTOCHCrossingUp };
        return Object.assign(s, stoch307SignalConfirmation);
    });

    return stoch307SignalQuotes.filter((q) => {
        return q.isvalid === true;
    });
};

let addMonth = (date, month) => {
    let temp = date;
    temp = new Date(date.getFullYear(), date.getMonth(), 1);
    temp.setMonth(temp.getMonth() + (month + 1));
    temp.setDate(temp.getDate() - 1);
    if (date.getDate() < temp.getDate()) {
        temp.setDate(date.getDate());
    }

    return temp;
};

module.exports = {
    getStoch307Signals,
    addMonth
};

