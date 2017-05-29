const express = require('express');
var quotes = require('../server/services/quotes.jobs');

let routes = function(GapSignal){
    let gapSignalRouter = express.Router();

    let gapSignalController = require('../controllers/gapSignalController')(GapSignal, quotes);

    gapSignalRouter.route('/')
        .post(gapSignalController.post)
        .get(gapSignalController.get);

    return gapSignalRouter;
}

module.exports = routes;