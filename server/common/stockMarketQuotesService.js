const yahooFinance = require('yahoo-finance');
const googleFinance = require('google-finance');

let getQuoteSnapshot = (symbol, fields) => {
    yahooFinance.snapshot({
        symbol: symbol,
        fields: fields,
    }, function(err, snapshot) {
        console.log(snapshot);
    });
};

let getHistoricalQuotes = (symbol, from, to)=> {
    return googleFinance.historical({
        symbol: symbol,
        from: from,
        to: to
    });

    // return yahooFinance.historical({
    //     symbol: symbol,
    //     from: from,
    //     to: to,
    //     // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    // });
};

module.exports = {
    getQuoteSnapshot,
    getHistoricalQuotes
};