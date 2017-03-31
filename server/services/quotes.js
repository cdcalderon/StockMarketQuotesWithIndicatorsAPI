var schedule = require('node-schedule');

const {ObjectID} = require('mongodb');
const {StockEarning} = require('./../models/stockEarning');
var { StockQuote } = require('./../models/stockQuote');

const axios = require('axios');
const yahooFinance = require('yahoo-finance');
const SMA = require('technicalindicators').SMA;
const talib = require("talib")
const MACD = require('technicalindicators').MACD;
const Stochastic = require('technicalindicators').Stochastic;

const indicatorsUtils = require('../common/indicatorsUtils');

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
};





let getQuoteSnapshot = (symbol, fields) => {
    yahooFinance.snapshot({
        symbol: symbol,
        fields: fields,
    }, function(err, snapshot) {
        console.log(snapshot);
    });
};

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
    let offsetMACD = new Array(16).fill(undefined);
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
        let offsetSTOCH = new Array(data.begIndex).fill(undefined);
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
                isSMAGreenIT: indicatorsUtils.isSMAGreenIT(quotesArr[i-1],smas[i-1],q.close,smas[i]),
                isMACDGreenIT: indicatorsUtils.isMACDGreenIT(macds[i-1],macds[i]),
                isSTOCHGreenIT: indicatorsUtils.isSTOCHGreenIT(talibStochastics.outSlowK[i-1],
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
                is3ArrowGreenPositive: indicatorsUtils.is3GreenArrowPositive(q,i,quotesArr)
            }
        });

        loadedQuotesWithArrows = loadedQuotesWithArrows.map((q,i, quotesArr) => {
            return {
                date: q.date,
                open: q.open,
                close: q.close,
                high: q.high,
                low: q.low,
                is3ArrowGreenPositive: indicatorsUtils.validateGreenArrow(i,quotesArr)
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
                is3ArrowGreenPositive: indicatorsUtils.validateGreenArrow(q,i,quotesArr)
            }
        });

        console.log(filterQuotesWith3GreenArrows);
        return filterQuotesWith3GreenArrows;
    });

};




module.exports = {
    getHistoricalQuotes
}