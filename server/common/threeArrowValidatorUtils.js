const charMarkUtils = require('./charMarkUtils');

let getThreeArrowChartMarks = (fullQuotes) => {
    return fullQuotes.filter((q) => {
        return q.is3ArrowGreenPositive === true;
    }).map((q, i) => {
        return charMarkUtils.formatThreeArrowChartMark(q, i);
    });
}

let getThreeArrowSignals = (fullQuotes) => {
    return fullQuotes.filter((q) => {
        return q.is3ArrowGreenPositive === true;
    }).map((q, i) => {
        return charMarkUtils.formatSignals(q, i, '3arrow', 2);
    });
}

module.exports = {
    getThreeArrowChartMarks,
    getThreeArrowSignals
};