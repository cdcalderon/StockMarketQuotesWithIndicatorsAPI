const axios = require('axios');

let gapSignalController = (GapSignal, quotes) => {

    let post = (req, res) => {
        let symbols = req.body.params.symbols;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        let generatedSymbols = genSymbols(symbols);
        let symbol = generatedSymbols.next();

        let intervalGapId = setInterval(() => {
            console.log("Current Symbol" + symbol.value);

            quotes.populateGapSignals(from, to, symbol.value)
                .then((result) => {
                    console.log(`about to send response::  ${result}` );

                });

            symbol = generatedSymbols.next();

            if(symbol.done === true){
                clearInterval(intervalGapId);
                console.log("Done with GapSignals");
                res.send("OK");
            }

        },7500);

    };

    let postGapSignalsForAllSymbols = (req, res) => {
        // let from = new Date(req.body.params.from);
        // let to = new Date(req.body.params.to);
        let from = '2015-01-01';
        let to = new Date();
        getAllStocks()
            .then(function(stocks) {
                let allStocks = stocks.data;
                console.log(`Got: ${allStocks}`);

                let generatedSymbols = genSymbols(allStocks);
                let stock = generatedSymbols.next();

                let intervalGapId = setInterval(() => {
                    console.log("Current Symbol" + stock.value.symbol);

                    quotes.populateGapSignals(from, to, stock.value)
                        .then((result) => {
                            console.log(`about to send response::  ${result}` );
                        });

                    stock = generatedSymbols.next();

                    if(stock.done === true){
                        clearInterval(intervalGapId);
                        console.log("Done with GapSignals");
                        res.send("OK");
                    }
                },100);
            });
    };

    let getGaps = (req, res) => {
        let pagingInfo = req.body.pagingInfo;
        let from = req.body.from;
        let to = req.body.to;

        let bodyQuery = req.body.query;
        let filterQuery = {};

        // {$in: ['some title', 'some other title']}
        addDateRangeFilter(filterQuery, from, to);

        if(bodyQuery.symbols.length === 0) {
            addMarketCapFilter(filterQuery, bodyQuery.marketCaps);
            addExchangeFilter(filterQuery, bodyQuery.exchanges);
        }


        let paginationOptions = getPaginationOptions(pagingInfo);

        GapSignal.paginate(filterQuery, paginationOptions, function(err, result) {
            res.send(result)
        });
    };

    let getPaginationOptions = (pagingInfo) => {
        let offset = pagingInfo.pageSize * ( pagingInfo.currentPage - 1 );
        return {
            sort: { dateId: 1 },
            lean: true,
            offset: offset,
            limit: pagingInfo.pageSize
        };
    };



    let addMarketCapFilter = (filterQuery, mCaps) => {
        let cps = [];
        for(let c of mCaps) {
            if(c === 'l'){
                cps.push({marketCapNumeric: {$gte: (10 * 1000 * 1000 * 1000), }});
            } else if(c === 'm') {
                cps.push({marketCapNumeric: {$gte: 2 * 1000 * 1000 * 1000, $lte: 10 * 1000 * 1000 * 1000}});
            } else if(c === 's') {
                cps.push({marketCapNumeric: {$gte: 300 * 1000, $lte: 2 * 1000 * 1000 * 1000}});
            }
        }

        if(filterQuery.hasOwnProperty('$and')){
            filterQuery.$and.push({ $or : cps});
        } else {
            filterQuery.$and = [{ $or : cps}];
        }

        return filterQuery;
    };

    let addExchangeFilter = (filterQuery, exchangeFilterOptions) => {
        let exchanges = [];
        for(let c of exchangeFilterOptions) {
            if(c === 'nasdaq'){
                exchanges.push({exchange: 'NasdaqNM'});
            } else if(c === 'nyse') {
                exchanges.push({exchange: 'NYSE'});
            } else if(c === 'amex') {
                exchanges.push({exchange: 'AMEX'});
            }
        }

        if(filterQuery.hasOwnProperty('$and')){
            filterQuery.$and.push({ $or : exchanges});
        } else {
            filterQuery.$and = [{ $or : exchanges}];
        }

        return filterQuery;
    };

    let addDateRangeFilter = (filterQuery, from, to) => {
        if(from && to) {
            filterQuery.dateId = {$gte: from, $lte: to};
        }

        return filterQuery;
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }

    let getAllStocks = () => {
       // const baseHerokuUdpUrl = 'https://enigmatic-waters-56889.herokuapp.com';
        const baseHerokuUdpUrl = 'http://localhost:4600';
        const getAllSymbols = '/api/udf/allstocksfull';
        return axios.get(`${baseHerokuUdpUrl}${getAllSymbols}`);
    };

        return {
        post: post,
        getGaps: getGaps,
        postGapSignalsForAllSymbols: postGapSignalsForAllSymbols
    }

};

module.exports = gapSignalController;