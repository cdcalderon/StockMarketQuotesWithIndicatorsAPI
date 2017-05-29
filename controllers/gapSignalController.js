let gapSignalController = (GapSignal, quotes) => {

    let post = (req, res) => {
        let symbol = req.body.params.symbol;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        quotes.populateGapSignals(from, to, symbol)
            .then((result) => {
                console.log(`about to send response::  ${result}` );
                res.send("OK");
            });
    };

    let get = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from);
        let to = new Date(req.query.to);

        GapSignal.find().then((signals) => {
            res.send(signals)
        });
    };

    return {
        post: post,
        get: get
    }

}

module.exports = gapSignalController;