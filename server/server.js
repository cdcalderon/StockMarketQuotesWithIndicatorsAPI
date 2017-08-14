const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { mongoose } = require('./db/mongoose');
const { ThreeArrowSignal } = require('./models/threeArrowSignal');
const { GapSignal } = require('./models/gapSignal');
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const gapSignalRouter = require('../routes/gapSignalRoutes')(GapSignal);
const threeArrowSignalRouter = require('../routes/threeArrowSignalRoutes')(ThreeArrowSignal);
const stoch307SignalRouter = require('../routes/stoch307Routes')();
const udfRouter = require('../routes/udfRoutes')();
const signalFibProjectionsRouter = require('../routes/signalFibProjectionsRoutes')();


app.use('/api/gapsignals', gapSignalRouter);
app.use('/api/threearrowsignals', threeArrowSignalRouter);
app.use('/api/signals/stoch307', stoch307SignalRouter);
app.use('/api/udf', udfRouter);
app.use('/api/signals/fibprojections', signalFibProjectionsRouter);


app.listen(port, () => {
  console.log(`Started up at port ${port}`)
});

module.exports = { app };