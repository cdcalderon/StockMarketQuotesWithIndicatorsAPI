const express = require('express');

let routes = function(){
    let signalsDataFeedRouter = express.Router();

    let signalsDataFeedController = require('../controllers/signalsDataFeedController')();

    signalsDataFeedRouter.route('/populateall')
        .post(signalsDataFeedController.populateAllSignalsForAllSymbols);

    return signalsDataFeedRouter;
}

module.exports = routes;