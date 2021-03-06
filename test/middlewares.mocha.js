var uid = require('uid2');
var example = require('../example');

describe('Middlewares:', function () {

  var Lorem = example.models.Lorem;

  before(function (done) {
    example.reload(done);
  });

  it('should be a model', function () {
    Lorem.should.be.type('function');
    (new Lorem()).should.be.type('object');
  });

  var lorem = null;
  var id = uid(7);
  var stripe = null;
  var handler = null;

  before(function () {
    lorem = new Lorem({
      _id: id,
      name: 'Lorem middlewares'
    });
  });

  it('should be an object', function () {
    lorem.should.be.type('object');
  });

  it('should have a stripe client instance', function () {
    lorem.should.have.property('stripeClient').with.type(
      'function');
    lorem.stripeClient().should.be.type('object');
    stripe = lorem.stripeClient();
  });

  describe('checkStripeBody', function () {
    it('should be an object', function () {
      example.middlewares.checkStripeBody.should.be.type('function');
    });

    it('should return a handler function', function () {
      handler = example.middlewares.checkStripeBody(['plan', 'customerId']);
      handler.should.be.type('function');
    });

    it('should failed if req.body propertis dose not match', function (done) {
      var req = {
        body: {}
      };

      var res = {
        send: function () {
          //req.stripe.should.by.type('object');
          return done();
        }
      };

      handler(req, res);
    });

    it('should success if req.body propertis dose match', function (done) {
      var req = {
        body: {
          'plan': 'plan',
          'customerId': 'customerId'
        }
      };

      var res = {
        send: function (statusCode) {
          return done(new Error(statusCode));
        }
      };

      handler(req, res, done);
    });
  });


  describe('fetchStripeEvent', function () {
    var eventId = 'evt_4d7LTGawkM9EOT';

    it('should be an object', function () {
      example.middlewares.fetchStripeEvent.should.be.type('function');
    });

    it('should return a handler function', function () {
      handler = example.middlewares.fetchStripeEvent(stripe);
      handler.should.be.type('function');
    });

    it('should can fetch event objet', function (done) {
      var req = {
        body: {
          object: 'event',
          id: eventId
        }
      };

      var res = {
        send: function (statusCode) {
          return done(new Error(statusCode));
        }
      };

      handler(req, res, done);
    });
  });
});
