const express = require('express');
var quotes = require('../server/services/quote.service');

let routes = function(GapSignal){
    let gapSignalRouter = express.Router();

    let gapSignalController = require('../controllers/gapSignalController')(GapSignal, quotes);

    gapSignalRouter.route('/')
        .post(gapSignalController.post);

    gapSignalRouter.route('/filter')
        .post(gapSignalController.getGaps);

    gapSignalRouter.route('/filter/ranking')
        .post(gapSignalController.getTopCompanyGaps);

    gapSignalRouter.route('/creategapsallsymbols')
        .post(gapSignalController.postGapSignalsForAllSymbols);

    return gapSignalRouter;
}

module.exports = routes;