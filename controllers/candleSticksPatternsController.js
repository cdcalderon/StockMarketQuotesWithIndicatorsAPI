const filterComposer = require('../server/common/filterComposerUtils');
const stockMarketQuotesService = require('../server/common/stockMarketQuotesService');

let candleSticksPatternsController = (GapSignal, quotes) => {
    let get = (req, res) => {
        let symbols = req.body.params.symbols;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        res.send({
            date: '05/07/2017',
            type: "doji",
            volume: 23444444
        });

    };


    return {
        get: get
    }

};

module.exports = candleSticksPatternsController;