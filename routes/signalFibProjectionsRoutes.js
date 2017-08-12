const express = require('express');
const _ = require('lodash');
const quotes = require('../server/services/quote.service');
const gapValidatorUtils = require('../server/common/gapValidatorUtils');
const threeArrowValidatorUtils = require('../server/common/threeArrowValidatorUtils');


let routes = function(){
    let udfRouter = express.Router();

    let signalFibProjectionsController = require('../controllers/signalFibProjectionsController')(
        quotes,
        _,
        gapValidatorUtils,
        threeArrowValidatorUtils);

    udfRouter.route('/greenarrow')
        .get(signalFibProjectionsController.getMarksGreenArrowsProjections);

    udfRouter.route('/gap')
        .get(signalFibProjectionsController.getMarksGapWithPreviousQuote);

    return udfRouter;
};

module.exports = routes;