let isSMACrossingUp = (previousQuote, previousSMA10, currentClose, currentSMA10) => {
    if (previousQuote && previousSMA10 && currentClose && currentSMA10 ) {
        if (currentClose > currentSMA10 && previousQuote.close < previousSMA10) {
            return true
        }
        return false;
    }
};

let isMACDCrossingUp = (previousMacd, currentMacd) => {
    if (previousMacd && currentMacd) {
        if (currentMacd.histogram > 0 && previousMacd.histogram < 0) {
            return true;
        }
    }
    return false;
};

let isSTOCHCrossingUp = (previousSlowK, currentSlowK) => {
    if (previousSlowK & currentSlowK) {
        if ((currentSlowK > 20 && previousSlowK < 20)) {
            return true;
        }
    }
    return false;
};

let movingAvgPositiveSlope = (numOfDays, currentIndex, movingAvgs) => {
    return isGreaterConsecutiveDays(numOfDays, currentIndex, movingAvgs);
};

let isGreaterConsecutiveDays = (numOfDays, currentIndex, movingAvgs) => {
    let consecutiveDays = 0;
    if(currentIndex + 1 >= numOfDays) {
        for(let i = 0; i < numOfDays; i++) {
            if(movingAvgs[currentIndex - i] == null && movingAvgs[currentIndex - i - 1] == null){
                break;
            }
            if(movingAvgs[currentIndex - i] > movingAvgs[currentIndex - i - 1]) {
                consecutiveDays += 1;
            }
        }
        return consecutiveDays
    }
};


module.exports = {
    isSMACrossingUp,
    isMACDCrossingUp,
    isSTOCHCrossingUp,
    movingAvgPositiveSlope
};