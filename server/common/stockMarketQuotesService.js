const yahooFinance = require('yahoo-finance');
const googleFinance = require('google-finance');
const axios = require('axios');

let getQuoteSnapshot = (symbol, fields) => {
    yahooFinance.snapshot({
        symbol: symbol,
        fields: fields,
    }, function(err, snapshot) {
        console.log(snapshot);
    });
};

let getHistoricalQuotesGoogle = (symbol, from, to)=> {
    console.log("Reading------------------------------ Google Quotes");
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

let getHistoricalQuotesYahoo = (symbol, from, to)=> {
    console.log("Reading------------------------------ Yahoo Quotes");
    return yahooFinance.historical({
        symbol: symbol,
        from: from,
        to: to,
        // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
    });
};



let getHistoricalQuotesQuand = (symbol, from, to) => {
    console.log("Reading------------------------------ Quand Quotes");
    // https://www.quandl.com/api/v3/datasets/WIKI/AON.json?start_date=Sun Apr 30 2017 00:00:00 GMT-0500 (CDT)&end_date=Thu Jan 01 2037 00:00:00 GMT-0600 (CST)&api_key=bnz5KFRPyhYVR2Catk1Q
    let quandUrl = `https://www.quandl.com/api/v3/datasets/WIKI/${symbol}.json?start_date=${from}&end_date=${to}&api_key=bnz5KFRPyhYVR2Catk1Q`;
    // let base = 'http://www.quandl.com';
    // var address = "/api/v3/datatables/WIKI/PRICES.json" +
    //     "?api_key=" + 'bnz5KFRPyhYVR2Catk1Q' + // you should create a free account on quandl.com to get this key
    //     "&ticker=" + symbol +
    //     "&date.gte=" + from +
    //     "&date.lte=" + to;

    //console.log("Sending request to quandl for symbol " + symbol + ". url=" + address);

    return axios.get(quandUrl);
    // httpGet("www.quandl.com", address, function(result) {
    //     if (response.finished) {
    //         // we can be here if error happened on socket disconnect
    //         return;
    //     }
    //     var content = JSON.stringify(convertQuandlHistoryToUDFFormat(result));
    //     quandlCache[key] = content;
    //     sendResult(content);
    // });
};

let getAllStocks = () => {
     const baseHerokuUdpUrl = 'https://enigmatic-waters-56889.herokuapp.com';
    //const baseHerokuUdpUrl = 'http://localhost:4600';
    const getAllSymbols = '/api/udf/allstocksfull';
    return axios.get(`${baseHerokuUdpUrl}${getAllSymbols}`);
};



module.exports = {
    getQuoteSnapshot,
    getHistoricalQuotesGoogle,
    getHistoricalQuotesQuand,
    getHistoricalQuotesYahoo,
    getAllStocks
};