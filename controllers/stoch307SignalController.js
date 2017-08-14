const quotesStochSignals = require('../server/services/quotes.signals.stoch307');

let stoch307SignalController = (
    axios,
    quotes,
    moment,
    _,
    charMarkUtils,
    stockSignalsUtils) => {

    let getMarksStoch307Bull = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        // let from = moment.unix(req.query.from).format("MM/DD/YYYY");
        // let to = moment.unix(req.query.to).format("MM/DD/YYYY");
        let from = new Date(req.query.from * 1000);
        let to = new Date(req.query.to * 1000);

        from = quotesStochSignals.addMonth(from, -1);

        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicatorsForStoch307For307Signal)
            .then(quotesStochSignals.getStoch307Signals)
            .then((fullQuotes) => {

                res.send(fullQuotes);
            })
            .catch((error) => {
                console.log(error);
            });
    };


    return {
        getMarksStoch307Bull: getMarksStoch307Bull
    }

};

module.exports = stoch307SignalController;