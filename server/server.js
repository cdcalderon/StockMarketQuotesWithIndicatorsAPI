var express = require('express');
var bodyParser = require('body-parser');
var quotes = require('./services/quotes.jobs');
var cors = require('cors');

var { StockQuote } = require('./models/stockQuote');
var quotes = require('./services/quotes.jobs');

var app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get('/quotes', (req, res) => {
    quotes.getHistoricalQuotes('AAPL', '2015-12-01', '2016-12-31')
        .then(quotes.getIndicators)
        .then(quotes.createQuotesWithIndicatorsAndArrowSignals)
        .then((fullQuotes) => {
            res.send(fullQuotes);
        });
});



app.listen(port, () => {
  console.log(`Started up at port ${port}`)
});

module.exports = { app };
