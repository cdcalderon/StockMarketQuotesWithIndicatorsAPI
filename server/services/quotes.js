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
    console.log('SMAs :', smas);
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
        console.log("Stoch Function Results:");
        console.log(data.result);


        //TODO: Use promises
        let loadedQuotes = quotes.map((q, i) => {
            return {
                date: q.date,
                open: q.open,
                close: q.close,
                high: q.high,
                low: q.low,
                MACD: macds[i] ? macds[i].MACD : 0,
                MACDSignal: macds[i] ? macds[i].signal : 0,
                histogram: macds[i] ? macds[i].histogram : 0,
                stochasticsK: talibStochastics.outSlowK[i] ? talibStochastics.outSlowK[i] : 0,
                stochasticsD: talibStochastics.outSlowD[i] ? talibStochastics.outSlowD[i] : 0,
                SMA10: smas[i]
            }
        });

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

module.exports = {
    getSimpleMovingAverage,
    getHistoricalQuotes,
    getQuoteSnapshot
}