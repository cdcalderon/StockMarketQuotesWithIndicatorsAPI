const express = require('express');
const axios = require('axios');
const moment = require('moment');
const quotes = require('../server/services/quote.service');
const gapValidatorUtils = require('../server/common/gapValidatorUtils');
const charMarkUtils = require('../server/common/charMarkUtils');
const threeArrowValidatorUtils = require('../server/common/threeArrowValidatorUtils');
const stockSignalsUtils = require('../server/common/stockSignalsUtils');

let routes = function(){
    let udfRouter = express.Router();

    let udfController = require('../controllers/udfController')(
        axios,
        quotes,
        moment,
        gapValidatorUtils,
        charMarkUtils,
        threeArrowValidatorUtils,
        stockSignalsUtils);

    udfRouter.route('/history')
        .get(udfController.getHistory);

    udfRouter.route('/config')
        .get(udfController.getConfig);

    udfRouter.route('/marksgaps')
        .get(udfController.getMarksGaps);

    udfRouter.route('/historicalgaps')
        .get(udfController.getHistoricalGaps);

    udfRouter.route('/marksgapswithpreviousquote')
        .get(udfController.getMarksGapWithPreviousQuote);

    udfRouter.route('/marks')
        .get(udfController.getMarks);

    udfRouter.route('/signals')
        .get(udfController.getSignals);

    udfRouter.route('/marksgreenarrows')
        .get(udfController.getMarksGreenArrows);

    udfRouter.route('/symbols')
        .get(udfController.getSymbols);

    udfRouter.route('/timescale_marks')
        .get(udfController.getTimescaleMarks);

    return udfRouter;
};

module.exports = routes;