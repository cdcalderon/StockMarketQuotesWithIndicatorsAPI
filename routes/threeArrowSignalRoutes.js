const express = require('express');
var quotes = require('../server/services/quote.service');

let routes = function(ThreeArrowSignal){
    let threeArrowSignalRouter = express.Router();

    let threeArrowSignalController = require('../controllers/threeArrowSignalController')(ThreeArrowSignal, quotes);

    threeArrowSignalRouter.route('/')
        .post(threeArrowSignalController.post);

    threeArrowSignalRouter.route('/filter')
        .post(threeArrowSignalController.getThreeArrowSignals);

    threeArrowSignalRouter.route('/filter/ranking')
        .post(threeArrowSignalController.getTopCompanyThreeArrow);

    threeArrowSignalRouter.route('/createthreearrowsignalsallsymbols')
        .post(threeArrowSignalController.postThreeArrowSignalsForAllSymbols);

    threeArrowSignalRouter.route('/testfunction')
        .post(threeArrowSignalController.postAzureFunc);



    return threeArrowSignalRouter;
}

module.exports = routes;