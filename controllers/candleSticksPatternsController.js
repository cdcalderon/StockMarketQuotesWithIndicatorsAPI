
let candleSticksPatternsController = () => {
    let get = (req, res) => {
        res.send({
            date: '05/07/2017',
            type: "doji",
            volume: 444444455666
        });

    };



    return {
        get: get
    }

};

module.exports = candleSticksPatternsController;