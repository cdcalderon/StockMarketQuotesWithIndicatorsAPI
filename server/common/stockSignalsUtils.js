const _ = require('lodash-node');

let mergeSignalsAndSortByTime = (signalsSet1, signalsSet2 ) => {
    let mergedSignals = signalsSet1.concat(signalsSet2);

    return _.sortBy(mergedSignals, [function(o) { return o.time; }]);
}

module.exports = {
    mergeSignalsAndSortByTime
};