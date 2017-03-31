var schedule = require('node-schedule');
const {ObjectID} = require('mongodb');
var { StockQuote } = require('./../models/stockQuote');
const indicatorsUtils = require('../common/indicatorsUtils');


let promiseSTOCHs;

let getHistoricalQuotes = (symbol, from, to) => {
    new Promise((resolve, reject) => {
        indicatorsUtils.getHistoricalQuotes(symbol,from,to,resolve, reject);
    }).then((quotes) => {
        populateIndicators(quotes);
    });
};

let populateIndicators = (quotes) => {
    let { highs, lows, closes } = indicatorsUtils.getHLC(quotes);
    let smas = indicatorsUtils.getSMAs(10, closes);
    let macds = indicatorsUtils.getMACDs(closes, 8, 17, 9, true, true);

    promiseSTOCHs = new Promise((resolve, reject) => {
        let endIndex = highs.length -1;
        indicatorsUtils.getSTOCHs("STOCH",5,14,0,5,0,0,endIndex,highs,lows, closes,resolve,reject);
    }).then((stochs) => {
        let fullQuotes = indicatorsUtils.createQuotesWithIndicatorsAndArrowSignals(quotes,smas,macds,stochs);
    });
};

module.exports = {
    getHistoricalQuotes
}