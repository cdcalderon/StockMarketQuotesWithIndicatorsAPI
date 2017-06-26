const _ = require('lodash-node');
const charMarkUtils = require('./charMarkUtils');

let getGapSignals = (fullQuotes) => {
     fullQuotes = _.map(fullQuotes, function(element, i, arr) {
        return _.extend({}, element, {
            gapSize: i > 0 ? Math.abs((element.close - arr[i-1].close)): 0,
            previousClose: i > 0 ? arr[i-1].close: 0,
            direction: i > 0 ? Math.abs((element.close - arr[i-1].close)) > 0 ? 'up' : 'down' : '-'
        });
    });

    return fullQuotes.filter((q,i,qts) => {
        return isGapValid(q, qts[i - 1]);
    });
}


let isGapValid = (currentQuote, previousQuote) => {
    let diffCriteria = getDiffAmount(currentQuote);
    let diffCriteriaPercent = currentQuote.close * .10;
    if(currentQuote && previousQuote) {
        let diffBetweenCurrentPreviousClose = Math.abs((currentQuote.close - previousQuote.close));
        let diffBetweenCurrentOpenPreviousClose = Math.abs((currentQuote.open - previousQuote.close));

        return ((diffBetweenCurrentPreviousClose > diffCriteria) ||
                (diffBetweenCurrentPreviousClose >= diffCriteriaPercent)) &&

                ((diffBetweenCurrentOpenPreviousClose > diffCriteria) ||
                (diffBetweenCurrentOpenPreviousClose >= diffCriteriaPercent));
    }
    return false;
};

let getGapChartMarks = (fullQuotes) => {
    let gaps = [];
    let quotesWithPreviosQuotesIncluded = _.map(fullQuotes, (element, i, arr) => {
        return _.extend({}, element, {
            previousQuote: arr[i - 1] || null
        });
    });

    quotesWithPreviosQuotesIncluded.forEach((q, i, qts) => {
        let diffCriteria = getDiffAmount(q);
        let diffCriteriaPercent = q.close * .10;
        if(i > 0) {
            let diffBetweenCurrentPreviousClose = Math.abs((q.close - qts[i-1].close));
            let diffBetweenCurrentOpenPreviousClose = Math.abs((q.open - qts[i-1].close));
            if (((diffBetweenCurrentPreviousClose > diffCriteria) || (diffBetweenCurrentPreviousClose >= diffCriteriaPercent)) &&
                ((diffBetweenCurrentOpenPreviousClose > diffCriteria) || (diffBetweenCurrentOpenPreviousClose >= diffCriteriaPercent))) {

                q.direction = (q.close - qts[i-1].close) < 0 ? 'down' : 'up';
                q.gapSize = (q.close - qts[i-1].close);
                gaps.push(q);
            }
        }
    });

    return gaps.map((q, i) => {
            return charMarkUtils.formatGapChartMark(q,i);
    });

    // return quotesWithPreviosQuotesIncluded.filter((q,i,qts) => {
    //     let diffCriteria = getDiffAmount(q);
    //     let diffCriteriaPercent = q.close * .10;
    //     if(i > 0) {
    //         let diffBetweenCurrentPreviousClose = Math.abs((q.close - qts[i-1].close));
    //         let diffBetweenCurrentOpenPreviousClose = Math.abs((q.open - qts[i-1].close));
    //         return ((diffBetweenCurrentPreviousClose > diffCriteria) || (diffBetweenCurrentPreviousClose >= diffCriteriaPercent)) &&
    //             ((diffBetweenCurrentOpenPreviousClose > diffCriteria) || (diffBetweenCurrentOpenPreviousClose >= diffCriteriaPercent));
    //     }
    //     return false;
    // }).map((q, i) => {
    //     return charMarkUtils.formatGapChartMark(q,i);
    // });
}


let getDiffAmount = (q) => {
    if(q.close > 0  && q.close < 200) {
        return 3.5;
    } else if (q.close > 200 && q.close < 400){
        return 8;
    } else if(q.close > 400 && q.close < 600) {
        return 15.5;
    } else if(q.close > 600 && q.close < 800) {
        return 35;
    } else if(q.close > 800) {
        return 60;
    }
};

// let getPercentageAmount = (q) => {
//     if(q.close > 0  && q.close < 200) {
//         return .10;
//     } else if (q.close > 200 && q.close < 400){
//         return .12;
//     } else if(q.close > 400 && q.close < 600) {
//         return .13
//     } else if(q.close > 600) {
//         return .14
//     }
// };

module.exports = {
    getGapSignals,
    getGapChartMarks
};