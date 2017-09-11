const moment = require('moment');

let getGenericDate = (date) => {
    let d = new Date(date);
    d = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return moment(d, 'YYYY/MM/DD');
};

let getDateTimeStampFromDate = (date) => {
    return date / 1000;
};

let getGenericTimeStampDate = (date) => {
    return getDateTimeStampFromDate(getGenericDate(date));
};

module.exports = {
    getGenericDate,
    getDateTimeStampFromDate,
    getGenericTimeStampDate
};