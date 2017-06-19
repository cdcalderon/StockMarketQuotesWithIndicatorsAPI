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

    let get = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from);
        let to = new Date(req.query.to);

        GapSignal.find().then((signals) => {
            res.send(signals)
        });
    };

    function *genSymbols(array) {
        for (let i = 0; i < array.length; i++) {
            yield array[i];
        }
    }

    return {
        post: post,
        get: get
    }

}

module.exports = gapSignalController;