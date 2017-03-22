const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { StockEarning } = require('./../models/stockEarning');

const earnings = [{
   _id: new ObjectID(),
   symbol:'COST'
  }, {
   _id: new ObjectID(), 
   symbol:'AAPL'
  }];

beforeEach((done) => {
  StockEarning.remove({}).then(() => {
    StockEarning.insertMany(earnings);
  }).then(() => done());
});

describe('POST /earnings', ()=> {
  it('should create a new earning', (done) => {
    var symbol = 'MSFT';

    request(app)
      .post('/earnings')
      .send({symbol})
      .expect(200)
      .expect((res) => {
        expect(res.body.symbol).toBe(symbol);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        StockEarning.find({symbol}).then((earnings) => {
          expect(earnings.length).toBe(1);
          expect(earnings[0].symbol).toBe(symbol);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create earning with invalid body', (done) => {
    request(app)
      .post('/earnings')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        StockEarning.find().then((earnings) => {
          expect(earnings.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /earnings', ()=> {
  it('should get all earnings', (done) => {
    request(app)
      .get('/earnings')
      .expect(200)
      .expect((res) => {
        expect(res.body.earnings.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /earnings/:id', () => {
  it('should return earning doc', (done) => {
    request(app)
      .get(`/earnings/${earnings[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.earning.symbol).toBe(earnings[0].symbol);
      })
      .end(done);
  });

  it('should return 404 if earning not found', (done) => {
    // make sure you get a 404 back
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/earnings/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/earnings/1234fd`)
      .expect(404)
      .end(done);
  });
})