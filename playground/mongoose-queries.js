const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { StockEarning } = require('./../server/models/stockEarning');

var id = '58a9c91e3952b1358fccb4c2';

if(!ObjectID.isValid(id)) {
  console.log('ID not valid')
}

StockEarning.find({
  symbol: "AAPL"
}).then((earnings) => {
  console.log('Earnings', earnings);
});

StockEarning.findOne({
  _id: id
}).then((earning) => {
  console.log('Earning', earning);
});

StockEarning.findById(id).then((earning) => {
  if (!earning) {
    return console.log('Id not found')
  }
  console.log('Earning by Id', earning);
}).catch((e) => console.log(e));


