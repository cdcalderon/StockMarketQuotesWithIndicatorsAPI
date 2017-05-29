const express = require('express');
var quotes = require('../server/services/quotes.jobs');

let routes = function(ThreeArrowSignal){
    let threeArrowSignalRouter = express.Router();

    let threeArrowSignalController = require('../controllers/threeArrowSignalController')(ThreeArrowSignal, quotes);

    threeArrowSignalRouter.route('/')
        .post(threeArrowSignalController.post)
        .get(threeArrowSignalController.get);

    return threeArrowSignalRouter;
}

module.exports = routes;