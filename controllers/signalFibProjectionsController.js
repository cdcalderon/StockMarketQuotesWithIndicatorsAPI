let udfController = (
    quotes,
    _,
    gapValidatorUtils,
    threeArrowValidatorUtils) => {

    let getMarksGapWithFibProjections = (req, res) => {
        let symbol = req.query.symbol;
        let from = req.query.from;
        let to = req.query.to;
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {
                let gapSignals = gapValidatorUtils.getGapChartMarks(fullQuotes);
                gapSignals = gapSignals.map((q) => {
                    let previousLow = q.previousQuote.low;
                    let currentHigh = q.high;
                    let currentLow = q.low;
                    let currentOpen = q.open;

                    let previousHigh = q.previousQuote.high;

                    let fib618Projection = getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.618);
                    let fib382Projection = getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.382);
                    let confirmationEntryPrice = getGapEntryPoint(q, fib382Projection, fib618Projection);
                    return {
                        high: q.high,
                        low: q.low,
                        direction: q.direction,
                        gapSize:q.gapSize,
                        signalDate: q.time,
                        drawExtensionDate: Math.floor(new Date(q.time * 1000) / 1000 + 4 * 30 * 24 * 60 * 60),
                        projection382: fib382Projection,
                        projection50: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.5),
                        projection618: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 0.618),
                        projection100: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 1),
                        projection1618: getFibonacciProjection(q.direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, 1.618),
                        retracement382: getFibonacciRetracement(q.direction, previousLow, currentHigh, currentLow, previousHigh, 0.382),
                        retracement50: getFibonacciRetracement(q.direction, previousLow, currentHigh, currentLow,  previousHigh, 0.5),
                        retracement618: getFibonacciRetracement(q.direction, previousLow, currentHigh, currentLow, previousHigh, 0.618),
                        retracement100: getFibonacciRetracement(q.direction, previousLow, currentHigh, currentLow, previousHigh, 1),
                        retracement1618: getFibonacciRetracement(q.direction, previousLow, currentHigh, currentLow, previousHigh, 1.618),
                        confirmationEntryPrice: confirmationEntryPrice
                    }
                });
                res.send(gapSignals);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    let getMarksGreenArrowsWithFibProjections = (req, res) => {
        let symbol = req.query.symbol;
        let resolution = req.query.resolution;
        let from = req.query.from;
        let to = req.query.to;
        quotes.getHistoricalQuotes(symbol, from, to)
            .then(quotes.getIndicators)
            .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
            .then((fullQuotes) => {

                let threeArrowSignals = threeArrowValidatorUtils.getThreeArrowChartMarks(fullQuotes);

                let grenMarksProjections = findFibPivotPoints(fullQuotes, threeArrowSignals);

                res.send(grenMarksProjections);
            })
            .catch((error) => {
                res.statusCode(500).send("error");
                console.log(error);
            });
    };

    let getGapEntryPoint = (signal, signalFib382Projection,  signalFib618Projection) => {
        let confirmationEntryPrice = 0;
        if (signal.direction === 'up') {
            confirmationEntryPrice = signal.high > signalFib382Projection ? signal.high : signalFib382Projection;
        } else if (signal.direction === 'down') {
            confirmationEntryPrice = signalFib618Projection;
        }
        return confirmationEntryPrice;
    };


    let getFibonacciProjection = (direction, previousLow, currentHigh, currentLow, previousHigh, currentOpen, fibPercentage) => {
        let projection = 0;

        if (direction === 'up') {
            projection = ((currentHigh - previousLow) * fibPercentage) + currentLow;
        } else if (direction === 'down') {
            projection = Math.abs(currentOpen - ((previousHigh - currentLow) * fibPercentage));
        }

        return projection;
    };

    let getFibonacciRetracement = (direction, previousLow, currentHigh, currentLow, previousHigh, fibPercentage) => {
        let retracement = 0;

        if (direction === 'up') {
            retracement = currentHigh - ((currentHigh - previousLow) * fibPercentage);
        } else if(direction === 'down'){
            retracement = Math.abs(currentLow + ((previousHigh - currentLow) * fibPercentage));
        }

        return retracement;
    };







    let findFibPivotPoints = (quotes, signals) => {
        let signalProjections = [];

        for(let signal of signals) {
            let sigIndex = _.findIndex(quotes, function(s) { return s.timeStampDate === signal.time; });
            let a = signal.low;
            let b = signal.high;
            let c = signal.low;
            let numOfDaysRange = 1;

            a = find_A_fibPivotPoint(a, quotes, sigIndex, numOfDaysRange);
            let fibPivotBPoint = find_B_fibPivotPoint(b, quotes, sigIndex, numOfDaysRange);
            b = fibPivotBPoint.b;
            c = find_C_fibPivotPoint(b, quotes, fibPivotBPoint.bIndex, numOfDaysRange);

            let fib618Projection = getFibonacciProjection('up', a, b, c, null, null, 0.618);
            let fib382Projection = getFibonacciProjection('up', a, b, c, null, null, 0.382);
            let confirmationEntryPrice = fib618Projection;

            signalProjections.push(
                {
                    a:a,
                    b:b,
                    c:c,
                    high: signal.high,
                    low: signal.low,
                    direction: 'up',
                    signalDate: signal.time,
                    drawExtensionDate: Math.floor(new Date(signal.time * 1000) / 1000 + 4 * 30 * 24 * 60 * 60),
                    projection382: fib382Projection,
                    projection50: getFibonacciProjection('up', a, b, c, null, null, 0.5),
                    projection618: getFibonacciProjection('up', a, b, c, null, null, 0.618),
                    projection100: getFibonacciProjection('up', a, b, c, null, null, 1),
                    projection1618: getFibonacciProjection('up', a, b, c, null, null, 1.618),
                    retracement382: getFibonacciRetracement('up', a, b, c, null, 0.382),
                    retracement50: getFibonacciRetracement('up', a, b, c, null, 0.5),
                    retracement618: getFibonacciRetracement('up', a, b, c, null, 0.618),
                    retracement100: getFibonacciRetracement('up', a, b, c, null, 1),
                    retracement1618: getFibonacciRetracement('up', a, b, c, null, 1.618),
                    confirmationEntryPrice: confirmationEntryPrice
                }
            )
        }
        return signalProjections;
    };

    let find_A_fibPivotPoint = (a, quotes, signalIndex, numOfDaysRange) => {
        let calculated_A = a;
        for (let i = signalIndex- 1; i > 0; i--) {

            if(numOfDaysRange === 0){
                break;
            }
            if(quotes[i].low < calculated_A){
                calculated_A = quotes[i].low;
            } else{
                numOfDaysRange--;
            }
        }
        return calculated_A;
    };

    let find_B_fibPivotPoint = (b, quotes,  signalIndex, numOfDaysRange) => {
        let calculated_B = b;
        let calculated_BIndex = signalIndex;

        for (let i = signalIndex + 1; i < quotes.length; i++) {

            if(numOfDaysRange === 0){
                break;
            }
            if(quotes[i].high > calculated_B){
                calculated_BIndex = i;
                calculated_B = quotes[i].high;
            } else{
                numOfDaysRange--;
            }
        }

        return {b:calculated_B, bIndex: calculated_BIndex};
    };

    let find_C_fibPivotPoint = (c, quotes, signalIndex, numOfDaysRange) => {
        let calculated_C = c;

        for (let i = signalIndex + 1; i < quotes.length; i++) {

            if(numOfDaysRange === 0){
                break;
            }
            if(quotes[i].low < calculated_C){
                calculated_C = quotes[i].low;
            } else{
                numOfDaysRange--;
            }
        }

        return calculated_C;
    };


    return {

        getMarksGapWithPreviousQuote: getMarksGapWithFibProjections,
        getMarksGreenArrowsProjections: getMarksGreenArrowsWithFibProjections
    }

};

module.exports = udfController;
