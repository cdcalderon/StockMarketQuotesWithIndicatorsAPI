
let isSMAGreenIT = (previousQuote, previousSMA10, currentClose, currentSMA10) => {
    if (previousQuote && previousSMA10 && currentClose && currentSMA10 ) {
        if (currentClose > currentSMA10 && previousQuote.close < previousSMA10) {
            return true
        }
        return false;
    }
};

let isMACDGreenIT = (previousMacd, currentMacd) => {
    if (previousMacd && currentMacd) {
        if (currentMacd.histogram > 0 && previousMacd.histogram < 0) {
            return true;
        }
    }

    return false;
};

let isSTOCHGreenIT = (previousSlowK, currentSlowK, currentSlowD) => {
    if (previousSlowK & currentSlowK && currentSlowD) {
        if ((currentSlowK > 20 && previousSlowK < 20 && currentSlowD < currentSlowK)) {
            return true;
        }
    }
    return false;
};

let is3GreenArrowPositive = (currentQuote, currentDayIndex, quotes) => {
    if(are3IndicatorsPositive(currentQuote)) {
        return true;
    } else {
        if(isSMAGreenPositive(currentQuote, 3, currentDayIndex, quotes) &&
            isMACDGreenPositive(currentQuote, 3, currentDayIndex, quotes) &&
            isSTOCHGreenPositive(currentQuote, 3, currentDayIndex, quotes) ) {
            return true;
        }
    }
    return false;
};

let are3IndicatorsPositive = (currentQuote) => {
    return currentQuote.isSMAGreenIT === true &&
        currentQuote.isMACDGreenIT === true &&
        currentQuote.isSTOCHGreenIT === true;
};

let isSMAGreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isSMA10(currentQuote)) {
        return true;
    } else {
        if(isSMAGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
};

let isSMA10 = (currentQuote) => {
    return currentQuote.isSMAGreenIT === true;
};

let isSMAGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while(daysToLookBack > 0){
        let quote = quotes[currentDayIndex - indexDay];
        if(quote) {
            if(quote.isSMAGreenIT === true) {
                return true;
            }
        }
        indexDay++;
        daysToLookBack--;
    }
    return false;
};

let isMACDGreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isMACD(currentQuote)) {
        return true;
    } else {
        if(isMACDGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
};

let isMACD = (currentQuote) => {
    return currentQuote.isMACDGreenIT === true;
};

let isMACDGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while (daysToLookBack > 0) {
        let quote = quotes[currentDayIndex - indexDay];
        if (quote) {
            if (quote.isMACDGreenIT === true) {
                return true;
            }
        }

        indexDay++;
        daysToLookBack--;
    }
    return false;
};


let isSTOCHGreenPositive = (currentQuote, dayScope, currentDayIndex, quotes) => {
    if(isSTOCH(currentQuote)) {
        return true;
    } else {
        if(isSTOCHGreenITPreviousDays(dayScope, currentDayIndex, quotes)){
            return true;
        } else {
            return false;
        }
    }
};

let isSTOCH = (currentQuote) => {
    return currentQuote.isSTOCHGreenIT === true;
};

let isSTOCHGreenITPreviousDays = (daysScope, currentDayIndex, quotes) => {
    let indexDay = 1;
    let daysToLookBack = daysScope;
    while(daysToLookBack > 0){
        let quote = quotes[currentDayIndex - indexDay];
        if(quote) {
            if(quote.isSTOCHGreenIT === true){
                return true;
            }
        }

        indexDay++;
        daysToLookBack--;
    }
    return false;
};

let validateGreenArrow = (currentDayIndex, quotes) => {
    let currentQuote = quotes[currentDayIndex];
    if(currentDayIndex > 0){
        let previousDayQuote = quotes[currentDayIndex - 1];
        if(currentQuote.is3ArrowGreenPositive === true &&
            previousDayQuote.is3ArrowGreenPositive === true) {
            return false;
        }
    }

    return currentQuote != null ? currentQuote.is3ArrowGreenPositive : false;
};

module.exports = {
    isSMAGreenIT,
    isMACDGreenIT,
    isSTOCHGreenIT,
    is3GreenArrowPositive,
    are3IndicatorsPositive,
    isSMAGreenPositive,
    isSMA10,
    isSMAGreenITPreviousDays,
    isMACDGreenPositive,
    isMACD,
    isMACDGreenITPreviousDays,
    isSTOCHGreenPositive,
    isSTOCH,
    isSTOCHGreenITPreviousDays,
    validateGreenArrow

};