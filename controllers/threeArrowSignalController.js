let threeArrowSignalController = (ThreeArrowSignal, quotes) => {

    // let post = (req, res) => {
    //     let symbol = req.body.params.symbol;
    //     let from = new Date(req.body.params.from);
    //     let to = new Date(req.body.params.to);
    //
    //     quotes.populateThreeArrowSignal(from, to, symbol)
    //         .then((result) => {
    //             console.log(`about to send response::  ${result}` );
    //             res.send("OK");
    //         });
    // };

    let post = (req, res) => {
        let symbols = req.body.params.symbols;
        let from = new Date(req.body.params.from);
        let to = new Date(req.body.params.to);

        let generatedSymbols = genSymbols(symbols);
        let symbol = generatedSymbols.next();

        let intervalGapId = setInterval(() => {
            console.log("Current Symbol" + symbol.value);
            quotes.populateThreeArrowSignal(from, to, symbol.value)
                .then((result) => {
                    console.log(`about to send response::  ${result}` );

                });

            symbol = generatedSymbols.next();

            if(symbol.done === true){
                clearInterval(intervalGapId);
                console.log("Done with Three Arrow Signals");
                res.send("OK");
            }

        },5000);


    };

    let get = (req, res) => {
        let symbol = req.query.symbol;
        let from = new Date(req.query.from);
        let to = new Date(req.query.to);

        ThreeArrowSignal.find().then((signals) => {
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

module.exports = threeArrowSignalController;