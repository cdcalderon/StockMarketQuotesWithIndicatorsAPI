let addDateRangeFilter = (filterQuery, from, to) => {
    if(from && to) {
        filterQuery.dateId = {$gte: from, $lte: to};
    }

    return filterQuery;
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

let addSymbolsFilter = (filterQuery, symbolsFilterOptions) => {
    //filterQuery.symbol = {$in : symbolsFilterOptions};
    let syms = [];
    for(let s of symbolsFilterOptions) {
        syms.push({symbol: s});
    }

    if(filterQuery.hasOwnProperty('$and')){
        filterQuery.$and.push({ $or : syms});
    } else {
        filterQuery.$and = [{ $or : syms}];
    }
    return filterQuery;
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

let addPriceRangeFilter = (filterQuery, lowPrice, highprice) => {
    if(lowPrice && highprice) {
        filterQuery.close = {$gte: lowPrice, $lte: highprice};
    }

    return filterQuery;
};

let getFilterQuery = (queryProperties) => {
    let filterQuery = {};

    let pagingInfo = queryProperties.pagingInfo;
    let from = queryProperties.from;
    let to = queryProperties.to;

    let bodyQuery = queryProperties.query;

   addDateRangeFilter(filterQuery, from, to);

    if(!bodyQuery.symbols || (bodyQuery.symbols && bodyQuery.symbols.length === 0)) {
        if(bodyQuery.marketCaps && bodyQuery.marketCaps.length > 0) {
            addMarketCapFilter(filterQuery, bodyQuery.marketCaps);
        }

        if(bodyQuery.exchanges && bodyQuery.exchanges.length > 0) {
            addExchangeFilter(filterQuery, bodyQuery.exchanges);
        }

        if(bodyQuery.lowPriceRange >= 0 && bodyQuery.highPriceRange > 0) {
            addPriceRangeFilter(filterQuery, bodyQuery.lowPriceRange, bodyQuery.highPriceRange);
        }
    } else {
        addSymbolsFilter(filterQuery, bodyQuery.symbols);
    }

    let paginationOptions = getPaginationOptions(pagingInfo);

    return {paginationOptions, filterQuery};
};

module.exports = {
    addDateRangeFilter,
    addMarketCapFilter,
    addExchangeFilter,
    addSymbolsFilter,
    getPaginationOptions,
    getFilterQuery
};