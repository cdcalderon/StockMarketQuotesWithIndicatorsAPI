const express = require('express');
var quotes = require('../server/services/quote.service');

let routes = function(GapSignal){
    let gapSignalRouter = express.Router();

    let gapSignalController = require('../controllers/gapSignalController')(GapSignal, quotes);

    gapSignalRouter.route('/')
        .post(gapSignalController.post)
        .get(gapSignalController.get);

    gapSignalRouter.route('/creategapsallsymbols')
        .post(gapSignalController.postGapSignalsForAllSymbols);

    return gapSignalRouter;
}

module.exports = routes;