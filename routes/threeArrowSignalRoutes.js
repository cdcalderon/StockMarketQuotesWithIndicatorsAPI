const express = require('express');
var quotes = require('../server/services/quote.service');

let routes = function(ThreeArrowSignal){
    let threeArrowSignalRouter = express.Router();

    let threeArrowSignalController = require('../controllers/threeArrowSignalController')(ThreeArrowSignal, quotes);

    threeArrowSignalRouter.route('/')
        .post(threeArrowSignalController.post)

    threeArrowSignalRouter.route('/filter')
        .post(threeArrowSignalController.getThreeArrowSignals);

    threeArrowSignalRouter.route('/createthreearrowsignalsallsymbols')
        .post(threeArrowSignalController.postThreeArrowSignalsForAllSymbols);

    return threeArrowSignalRouter;
}

module.exports = routes;