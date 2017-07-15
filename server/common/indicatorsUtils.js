const SMA = require('technicalindicators').SMA;
const talib = require("talib")
const MACD = require('technicalindicators').MACD;
const _ = require('lodash-node');
const moment = require('moment');
const greenArrowValidatorService = require('./greenArrowValidatorUtils');



let createQuotesWithIndicatorsAndArrowSignals = (quotes,smas,macds,stochs ) => {
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
            SMA10: smas[i],
            isSMAGreenIT: greenArrowValidatorService.isSMAGreenIT(quotesArr[i-1],smas[i-1],q.close,smas[i]),
            isMACDGreenIT: greenArrowValidatorService.isMACDGreenIT(macds[i-1],macds[i]),
            isSTOCHGreenIT: greenArrowValidatorService.isSTOCHGreenIT(stochs.outSlowK[i-1],
                stochs.outSlowK[i],
                stochs.outSlowD[i])
        }
    });

    loadedQuotes = loadedQuotes.map((q,i,quotesArr) => {
        return {
            date: q.date,
            open: q.open,
            close: q.close,
            high: q.high,
            low: q.low,
            histogram: q.histogram,
            stochasticsK: q.stochasticsK,
            stochasticsD: q.stochasticsD,
            SMA10: q.SMA10,
            is3ArrowGreenPositive: greenArrowValidatorService.is3GreenArrowPositive(q,i,quotesArr)
        }
    });

    return loadedQuotes.map((q,i, quotesArr) => {
        var dataA = moment(q.date).utc();
        return {
            timeStampDate: dataA.valueOf() / 1000,
            date: q.date,
            open: q.open,
            close: q.close,
            high: q.high,
            low: q.low,
            histogram: q.histogram,
            stochasticsK: q.stochasticsK,
            stochasticsD: q.stochasticsD,
            SMA10: q.SMA10,
            is3ArrowGreenPositive: greenArrowValidatorService.validateGreenArrow(i,quotesArr)
        }
    });
};

let calculateIsGreenArrow = (previousQuote, previousSMA10, currentClose, currentSMA10,
                             previousMacd, currentMacd,
                             previousSlowK, currentSlowK, currentSlowD,
                             currentQuote, currentDayIndex, quotes) => {
    let isSMAGreen = greenArrowValidatorService.isSMAGreenIT(previousQuote, previousSMA10, currentClose, currentSMA10);
    let isMACDGreen = greenArrowValidatorService.isMACDGreenIT(previousMacd, currentMacd);
    let isSTOCHGreen = greenArrowValidatorService.isSTOCHGreenIT(previousSlowK, currentSlowK, currentSlowD);

    return greenArrowValidatorService.is3GreenArrowPositive({
        isSMAGreenIT: isSMAGreen,
        isMACDGreenIT: isMACDGreen,
        isSTOCHGreenIT: isSTOCHGreen
    },currentDayIndex,quotes);
};

///////////////////////    Indicators   /////////////////////////////

let getSMAs = (period, values) => {
    let offsetSMA = new Array(period -1).fill(undefined);
    let smas =  SMA.calculate({
        period: period,
        values: values
    });
    return [...offsetSMA, ...smas];// unshift undefined period - 1 times
};

let getMACDs = (values, fastPeriod, slowPeriod, signalPeriod,
                isSimpleMAOscillator, isSimpleMASignal) => {
    let offsetMACD = new Array(16).fill(undefined);

    let macdInput = {
        values: values,
        fastPeriod: 8,
        slowPeriod: 17,
        signalPeriod: 9,
        SimpleMAOscillator: isSimpleMAOscillator, //working with true
        SimpleMASignal: isSimpleMASignal // working with true
    };

    let macds = MACD.calculate(macdInput);
    return [...offsetMACD, ...macds];
};

let getSTOCHs = (stochsInput, resolve, reject) => {
    talib.execute(stochsInput, function(data) {
        if(data.error != null){
            return reject("Something when wrong getting STOCHs");
        }
        let offsetSTOCH = new Array(data.begIndex).fill(undefined);
        let talibStochastics = data.result;

        return resolve({
            outSlowD: [...offsetSTOCH, ...talibStochastics.outSlowD],
            outSlowK: [...offsetSTOCH, ...talibStochastics.outSlowK]
        });
    });

};



let getHLC = (quotes) => {
    return {
        closes: _.pluck(quotes, 'close'),
        lows: _.pluck(quotes, 'low'),
        highs: _.pluck(quotes, 'high')
    }
};

module.exports = {
    getSMAs,
    getMACDs,
    getSTOCHs,
    createQuotesWithIndicatorsAndArrowSignals,
    getHLC

};