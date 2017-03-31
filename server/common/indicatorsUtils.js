const yahooFinance = require('yahoo-finance');
const SMA = require('technicalindicators').SMA;
const talib = require("talib")
const MACD = require('technicalindicators').MACD;
const _ = require('lodash-node');

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
    }

    let macds = MACD.calculate(macdInput);
    return [...offsetMACD, ...macds];
};

let getSTOCHs = (name, slowK_Period, fastK_Period, slowKMAType,
                 slowD_Period, slowD_MAType, startIdx, endIdx,
                 highs, lows, closes, resolve, reject ) => {

    talib.execute({
        name: name,
        optInSlowK_Period: slowK_Period,
        optInFastK_Period: fastK_Period,
        optInSlowK_MAType: slowKMAType,
        optInSlowD_Period: slowD_Period,
        optInSlowD_MAType: slowD_MAType,
        startIdx: startIdx,
        endIdx: endIdx,
        high: highs,
        low: lows,
        close: closes,
    }, function(data) {
        if(data.error != null){
            reject("Something when wrong getting STOCHs");
        }
        let offsetSTOCH = new Array(data.begIndex).fill(undefined);
        let talibStochastics = data.result;
        //
        // talibStochastics.outSlowD = [...offsetSTOCH, ...talibStochastics.outSlowD];
        // talibStochastics.outSlowK = [...offsetSTOCH, ...talibStochastics.outSlowK];

        resolve({
            outSlowD: [...offsetSTOCH, ...talibStochastics.outSlowD],
            outSlowK: [...offsetSTOCH, ...talibStochastics.outSlowK]
        });
    });

};

let getSimpleMovingAverage = (period, values) => {
    var smas = SMA.calculate({
        period: 5,
        values: values
    });
};

let getQuoteSnapshot = (symbol, fields) => {
    yahooFinance.snapshot({
        symbol: symbol,
        fields: fields,
    }, function(err, snapshot) {
        console.log(snapshot);
    });
}

let isSMAGreenIT = (previousQuote, previousSMA10, currentClose, currentSMA10) => {
    if (previousQuote && previousSMA10 && currentClose && currentSMA10 ) {
        if (currentClose > currentSMA10 && previousQuote.close < previousSMA10) {
            return true
        }
        return false;
    }
}

let isMACDGreenIT = (previousMacd, currentMacd) => {
    if (previousMacd && currentMacd) {
        if (currentMacd.histogram > 0 && previousMacd.histogram < 0) {
            return true;
        }
    }

    return false;
}

let isSTOCHGreenIT = (previousSlowK, currentSlowK, currentSlowD) => {
    if (previousSlowK & currentSlowK && currentSlowD) {
        if ((currentSlowK > 20 && previousSlowK < 20 && currentSlowD < currentSlowK)) {
            return true;
        }
    }
    return false;
}

let is3GreenArrowPositive = (currentQuote, currentDayIndex, quotes) => {
    if(are3IndicatorsPositive(currentQuote)) {
        return true;
    } else {
        if(isSMAreenPositive(currentQuote, 3, currentDayIndex, quotes) &&
            isMACDGreenPositive(currentQuote, 3, currentDayIndex, quotes) &&
            isSTOCHGreenPositive(currentQuote, 3, currentDayIndex, quotes) ) {
            return true;
        }
    }
    return false;
}

let are3IndicatorsPositive = (currentQuote) => {
    return currentQuote.isSMAGreenIT === true &&
        currentQuote.isMACDGreenIT === true &&
        currentQuote.isSTOCHGreenIT === true;
}

let isSMAreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isSMA10(currentQuote)) {
        return true;
    } else {
        if(isSMAGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
}

let isSMA10 = (currentQuote) => {
    return currentQuote.isSMAGreenIT === true;
}

let isSMAGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while(daysToLookBack > 0){
        let quote = quotes[currentDayIndex - indexDay];
        if(quote) {
            if(quote.isSMAGreenIT === true) {
                return true;
            }
        }
        indexDay++;
        daysToLookBack--;
    }
    return false;
}

let isMACDGreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isMACD(currentQuote)) {
        return true;
    } else {
        if(isMACDGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
}

let isMACD = (currentQuote) => {
    return currentQuote.isMACDGreenIT === true;
}

let isMACDGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while (daysToLookBack > 0) {
        let quote = quotes[currentDayIndex - indexDay];
        if (quote) {
            if (quote.isMACDGreenIT === true) {
                return true;
            }
        }

        indexDay++;
        daysToLookBack--;
    }
    return false;
}


let isSTOCHGreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isSTOCH(currentQuote)) {
        return true;
    } else {
        if(isSTOCHGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
}

let isSTOCH = (currentQuote) => {
    return currentQuote.isSTOCHGreenIT === true;
}

let isSTOCHGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while(daysToLookBack > 0){
        let quote = quotes[currentDayIndex - indexDay];
        if(quote) {
            if(quote.isSTOCHGreenIT === true){
                return true;
            }
        }

        indexDay++;
        daysToLookBack--;
    }
    return false;
};

let validateGreenArrow = (currentDayIndex, quotes) => {
    let currentQuote = quotes[currentDayIndex]
    if(currentDayIndex > 0){
        let previousDayQuote = quotes[currentDayIndex - 1];
        if(currentQuote.is3ArrowGreenPositive === true &&
            previousDayQuote.is3ArrowGreenPositive === true) {
            return false;
        }
    }

    return currentQuote != null ? currentQuote.is3ArrowGreenPositive : false;
};

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
            isSMAGreenIT: isSMAGreenIT(quotesArr[i-1],smas[i-1],q.close,smas[i]),
            isMACDGreenIT: isMACDGreenIT(macds[i-1],macds[i]),
            isSTOCHGreenIT: isSTOCHGreenIT(stochs.outSlowK[i-1],
                stochs.outSlowK[i],
                stochs.outSlowD[i])
        }
    });

    return loadedQuotes.map((q,i,quotesArr) => {
        return {
            date: q.date,
            open: q.open,
            close: q.close,
            high: q.high,
            low: q.low,
            histogram: q.histogram,
            stochasticsK: q.stochasticsK,
            SMA10: q.SMA10,
            is3ArrowGreenPositive: is3GreenArrowPositive(q,i,quotesArr)
        }
    });
};

let getHistoricalQuotes = (symbol, from, to, resolve, reject)=> {
    yahooFinance.historical({
        symbol: symbol,
        from: from,
        to: to,
        // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    }, function(err, quotes) {
        resolve(quotes);
       // populateIndicators(quotes);

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
    getSimpleMovingAverage,
    getQuoteSnapshot,
    isSMAGreenIT,
    isMACDGreenIT,
    isSTOCHGreenIT,
    is3GreenArrowPositive,
    are3IndicatorsPositive,
    isSMAreenPositive,
    isSMA10,
    isSMAGreenITPreviousDays,
    isMACDGreenPositive,
    isMACD,
    isMACDGreenITPreviousDays,
    isSTOCHGreenPositive,
    isSTOCH,
    isSTOCHGreenITPreviousDays,
    validateGreenArrow,
    getSMAs,
    getMACDs,
    getSTOCHs,
    createQuotesWithIndicatorsAndArrowSignals,
    getHistoricalQuotes,
    getHLC

};