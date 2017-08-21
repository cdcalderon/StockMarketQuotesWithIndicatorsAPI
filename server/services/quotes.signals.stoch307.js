const stoch307SignalValidator = require('../common/stoch307ValidatorUtils');
const quotes = require('./quote.service');
const moment = require('moment');
const {Stoch307Signal} = require('../models/stoch307Signal');
const chalk = require('chalk');
const log = console.log;


let getStoch307SignalsBull = (symbol, from, to) => {
    return quotes.getHistoricalQuotes(symbol, from, to)
        .then(quotes.getIndicatorsForStoch307For307Signal)
        .then(getStoch307SignalsBullStep2);
};

let getStoch307SignalsBullStep2 = (indicators) => {
    let macdSmasQuotes = indicators[0];
    let stochs = indicators[1];

    return Promise.resolve(getStoch307SignalsBullStep3(
        macdSmasQuotes.quotes,
        macdSmasQuotes.xmas.xmas7,
        macdSmasQuotes.xmas.xmas30,
        macdSmasQuotes.macds,
        stochs));
};

let getStoch307SignalsBullStep3= (quotes,xmas7,xmas30,macds,stochs ) => {
    let loadedQuotes = quotes.map((q, i, quotesArr) => {
        let dateTS = moment(q.date).utc();
        return {
            date: q.date,
            timeStampDate: dateTS.valueOf() / 1000,
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

let postStoch307BullSignalsForAllSymbols = (from, to, stock) => {
    return getStoch307SignalsBull(stock.symbol, from, to)
        .then((fullQuotes) => {
            for(let quote of fullQuotes) {
                Stoch307Signal.find({
                    symbol: stock.symbol,
                    dateId: new Date(quote.date) / 1000})
                    .then((stoch307Signals => {
                        if (stoch307Signals.length === 0) {
                            let sQuote = new Stoch307Signal({
                                symbol: stock.symbol,
                                dateStr: quote.date,
                                open: quote.open,
                                high: quote.high,
                                low: quote.low,
                                close: quote.close,
                                movingExAvg7: quote.XMA7,
                                movingExAvg30: quote.XMA30,
                                stochasticsK: quote.stochasticsK,
                                stochasticsD: quote.stochasticsD,
                                macdHistogram: quote.histogram,
                                dateId: new Date(quote.date) / 1000,
                                exchange: stock.exchange,
                                summaryQuoteUrl: stock.summaryQuoteUrl,
                                industry: stock.industry,
                                sector: stock.sector,
                                name: stock.name,
                                marketCapNumeric: stock.marketCapNumeric,
                                marketCap: stock.marketCap,
                                movingExAvg30PositiveSlope: quote.EMA30PositiveSlope,
                                directionType: 'bull'
                            });

                            sQuote.save().then((doc) => {
                                log(chalk.yellow('success saving.. : ', doc));
                            }, (e) => {
                                log(chalk.yellow(chalk.red('error saving.. : '), e));
                            });
                        } else {
                            log(chalk.yellow(`Stoch 307 Signal already on DB symbol ${stock.symbol}`));
                        }
                    }));
            }

            return 1;
        })
        .catch((error) => {
            console.log(error);
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
    getStoch307SignalsBull,
    postStoch307BullSignalsForAllSymbols,
    addMonth
};

