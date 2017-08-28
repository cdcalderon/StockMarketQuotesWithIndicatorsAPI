const { GapSignal } = require('../models/gapSignal');
const charMarkUtils = require('../common/charMarkUtils');
const quotesService = require('./quote.service');
const gapValidatorUtils = require('../common/gapValidatorUtils');

let getGapMarksFromCollection = (symbol, from, to) => {
    return new Promise((resolve, reject) => {
        GapSignal.find({
            $and: [{dateId: {$gte: from, $lte: to}}, {symbol: symbol}]

        }).then((gaps)=> {
            let marks = gaps.map((q, i) => {
                q._doc.timeStampDate = q._doc.dateId;
                q._doc.previousQuote = q._doc.previousClose;
                return charMarkUtils.formatGapChartMark(q._doc,i);
            });

            marks = charMarkUtils.formatMarksResult(marks);
            resolve(marks);
        }).catch((error) => {
            if(error){
                reject(error);
            }
        });
    });
};

let getGapMarksFromQuotes = (symbol, from, to) => {
    return new Promise((resolve, reject) => {
        quotesService.getHistoricalQuotes(symbol, from, to)
            .then(quotesService.getIndicators)
            .then(quotesService.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);
                let marks = charMarkUtils.formatMarksResult(gapSignals);

                resolve(marks);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });

};

module.exports = {
    getGapMarksFromCollection,
    getGapMarksFromQuotes
};