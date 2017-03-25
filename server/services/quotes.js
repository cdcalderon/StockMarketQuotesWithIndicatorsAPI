var schedule = require('node-schedule');
const {ObjectID} = require('mongodb');
const {StockEarning} = require('./../models/stockEarning');
const axios = require('axios');
const yahooFinance = require('yahoo-finance');
const SMA = require('technicalindicators').SMA;
const talib = require("talib")
const MACD = require('technicalindicators').MACD;
const Stochastic = require('technicalindicators').Stochastic

let getSimpleMovingAverage = (period, values) => {
    var smas = SMA.calculate({
        period: 5,
        values: values
    });
    //console.log('SMAs :', smas);
}

let getHistoricalQuotes = (symbol, from, to) => {
    yahooFinance.historical({
        symbol: symbol,
        from: from,
        to: to,
        // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    }, function(err, quotes) {
        populateIndicators(quotes);
        //console.log(quotes);
    });
}

let getQuoteSnapshot = (symbol, fields) => {
    yahooFinance.snapshot({
        symbol: symbol,
        fields: fields,
    }, function(err, snapshot) {
        console.log(snapshot);
    });
}

let populateIndicators = (quotes) => {

    let closes = quotes.map((q) => {
        return q.close;
    });

    let lows = quotes.map((q) => {
        return q.low;
    });

    let highs = quotes.map((q) => {
        return q.high;
    });

    let smas = SMA.calculate({
        period: 10,
        values: closes
    });

    let offsetSMA = new Array(9).fill(undefined)
    smas = [...offsetSMA, ...smas];

    let macdInput = {
        values: closes,
        fastPeriod: 8,
        slowPeriod: 17,
        signalPeriod: 9,
        SimpleMAOscillator: true, //working with true
        SimpleMASignal: true // working with true
    }

    let macds = MACD.calculate(macdInput);
    let offsetMACD = new Array(16).fill(undefined)
    macds = [...offsetMACD, ...macds];

    //------stochastics
    let high = highs;
    let low = lows;
    let close = closes;
    let period = 14;
    let signalPeriod = 5;

    let input = {
        high: high,
        low: low,
        close: close,
        period: period,
        signalPeriod: signalPeriod
    };

    // let stochastics = Stochastic.calculate(input);
    // var stoch = talib.STOCH(
    //     high, 
    //     low,
    //     close,
    //     fastk_period = 14,
    //     slowk_period = 5,
    //     slowk_matype = 0,
    //     slowd_period = 5,
    //     slowd_matype = 0)

    let talibStochastics;
    talib.execute({
        name: "STOCH",
        optInSlowK_Period: 5,
        optInFastK_Period: 14,
        optInSlowK_MAType: 0,
        optInSlowD_Period: 5,
        optInSlowD_MAType: 0,
        startIdx: 0,
        endIdx: high.length - 1,
        high,
        low,
        close,
    }, function(data) {
        talibStochastics = data.result;
        let offsetSTOCH = new Array(data.begIndex).fill(undefined)
        talibStochastics.outSlowD = [...offsetSTOCH, ...talibStochastics.outSlowD];
        talibStochastics.outSlowK = [...offsetSTOCH, ...talibStochastics.outSlowK];
        //console.log("Stoch Function Results:");
       // console.log(data.result);


        //TODO: Use promises
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
                stochasticsK: talibStochastics.outSlowK[i] ? talibStochastics.outSlowK[i] : undefined,
                stochasticsD: talibStochastics.outSlowD[i] ? talibStochastics.outSlowD[i] : undefined,
                SMA10: smas[i],
                // isMACDGreen: isMACDGreen(macds[i]),
                // isSMAGreen: isSMAGreen(q.close,smas[i]),
                // isSTOCHGreen: isSTOCHGreen(talibStochastics.outSlowK[i],talibStochastics.outSlowD[i]
                // ),
                isSMAGreenIT: isSMAGreenIT(quotesArr[i-1],smas[i-1],q.close,smas[i]),
                isMACDGreenIT: isMACDGreenIT(macds[i-1],macds[i]),
                isSTOCHGreenIT: isSTOCHGreenIT(talibStochastics.outSlowK[i-1],
                                               talibStochastics.outSlowK[i], 
                                               talibStochastics.outSlowD[i])
            }
        });

        var loadedQuotesWithArrows = loadedQuotes.map((q,i,quotesArr) => {
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

        loadedQuotesWithArrows = loadedQuotesWithArrows.map((q,i, quotesArr) => {
            return {
                date: q.date,
                open: q.open,
                close: q.close,
                high: q.high,
                low: q.low,
                is3ArrowGreenPositive: validateGreenArrow(i,quotesArr)
            }
        });

        var filterQuotesSMAsGreen = loadedQuotes.filter(q => q.isSMAGreenIT === true);
        var filterQuotesMACDsGreen = loadedQuotes.filter(q => q.isMACDGreenIT === true);
        var filterQuotesSTOCHsGreen = loadedQuotes.filter(q => q.isSTOCHGreenIT === true);

        var filterQuotesWith3GreenArrows = loadedQuotesWithArrows.filter(q => q.is3ArrowGreenPositive === true);
        filterQuotesWith3GreenArrows = filterQuotesWith3GreenArrows.map((q,i, quotesArr) => {
            return {
                date: q.date,
                open: q.open,
                close: q.close,
                high: q.high,
                low: q.low,
                is3ArrowGreenPositive: validateGreenArrow(q,i,quotesArr)
            }
        });

        console.log(filterQuotesWith3GreenArrows);
    });

    // talib.execute({
    //     name: "MACD",
    //     startIdx: 0,
    //     endIdx: close.length - 1,
    //     inReal: close,
    //     optInFastPeriod: 8,
    //     optInSlowPeriod: 17,
    //     optInSignalPeriod: 9
    // }, function(result) {
    //     console.log(result);
    // });


}
let isSMAGreen = (lastClose, movingAverage10) => {
    if (lastClose && movingAverage10 ) {
        if (lastClose > movingAverage10) {
            return true
        } else if (movingAverage10 >= lastClose) {
            return false;
        }
        return false;
    }
}

let isMACDGreen = (macdSignal) => {
    if(macdSignal > 0) {
        return true;
    } else if (macdSignal <=0) {
        return false;
    }
}

let isSTOCHGreen = (slowK, slowD) => {
    if (slowD & slowK ) {
        if ((slowK < 20 || slowD < 20) & slowK > slowD) {
            return true;
        } else if ((slowK > 80 || slowD > 80) && slowK < slowD) {
            return false;
        }
    }
    return false;
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
}

let validateGreenArrow = (currentDayIndex, quotes) => {
    let currentQuote = quotes[currentDayIndex]
    if(currentDayIndex > 0){
        let previousDayQuote = quotes[currentDayIndex - 1];
        if(currentQuote.is3ArrowGreenPositive === true && 
           previousDayQuote.is3ArrowGreenPositive === true) {
            return false;
        } 
    }

    return currentQuote.is3ArrowGreenPositive;
}

module.exports = {
    getSimpleMovingAverage,
    getHistoricalQuotes,
    getQuoteSnapshot
}