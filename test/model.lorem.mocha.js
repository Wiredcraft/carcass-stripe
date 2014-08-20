// var debug = require('debug')('carcass:test');

var should = require('should');
var uid = require('uid2');
var example = require('../example');

describe('Model / Lorem:', function () {

    var Lorem = example.models.Lorem;

    before(function (done) {
        example.reload(done);
    });

    it('should be a model', function () {
        Lorem.should.be.type('function');
        (new Lorem()).should.be.type('object');
    });

    describe('An instance:', function () {

        var lorem = null;
        var id = uid(7);
        var db = null;
        var stripe = null;

        before(function () {
            lorem = new Lorem({
                _id: id,
                name: 'Lorem 001'
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

        it('should can create customer', function (done) {
            lorem.createCustomer('test0@test.com', {
                number: '4242424242424242',
                exp_year: 2022,
                exp_month: 06
            }, function (err, customer) {
                if (err) return done(err);
                customer.should.be.type('object');

            lorem.set({
                stripe: {
                    customerId: customer.id
                }
            });

                done();
            });
        });

        it('should can subscripe to free plan', function (done) {
            var stripe = lorem.get('stripe');

            stripe.customerId.should.be.type('string');

            var plan = 'devops_free';
            var customerId = stripe.customerId;

            lorem.createSubscription(customerId, plan, function (err, subscription) {
                if (err) return done(err);
                subscription.should.be.type('object');
                subscription.id.should.be.type('string');

                lorem.set({
                    stripe: {
                        plan: plan,
                        customerId: customerId,
                        subscriptionId: subscription.id
                    }
                });

                done();
            });
        });

        it('should can update subscripe to new plan', function (done) {
            var stripe = lorem.get('stripe');
            stripe.customerId.should.be.type('string');
            stripe.subscriptionId.should.be.type('string');

            var customerId = stripe.customerId;
            var subscriptionId = stripe.subscriptionId;
            var newPlan = 'devops_bootstrap';

            lorem.updateSubscription(customerId, subscriptionId, newPlan, function(err, newSub) {
                if (err) return done(err);
                newSub.plan.id.should.equal(newPlan);

                lorem.set({
                    stripe: {
                        plan: newPlan,
                        customerId: customerId,
                        subscriptionId: newSub.id
                    }
                });

                done();
            });
        });

        it('should have a DB instance', function () {
            lorem.should.have.property('db').with.type('function');
            lorem.db().should.be.type('object');
            db = lorem.db();
        });

        it('declare DB', function (done) {
            db.declare(done);
        });

        it('cannot read from DB', function (done) {
            lorem.load(function (err) {
                err.should.be.instanceOf(Error);
                err.should.have.property('status', 404);
                done();
            });
        });

        it('can save to DB', function (done) {
            lorem.save(function (err, res) {
                if (err) return done(err);
                res.should.be.instanceOf(Lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 001');
                res.should.not.have.property('loadedFromDB');
                done();
            });
        });

        it('can read from DB', function (done) {
            lorem.load(function (err, res) {
                if (err) return done(err);
                res.should.equal(lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 001');
                res.should.have.property('loadedFromDB', true);
                done();
            });
        });

        it('update doc from another place', function (done) {
            db.save({
                _id: id,
                name: 'Lorem 002'
            }, done);
        });

        it('can read from DB', function (done) {
            lorem.load(function (err, res) {
                if (err) return done(err);
                res.should.equal(lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 002');
                done();
            });
        });

        it('can update to DB', function (done) {
            lorem.name('Lorem 003').save(function (err, res) {
                if (err) return done(err);
                res.should.be.instanceOf(Lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 003');
                done();
            });
        });

        it('can read from DB', function (done) {
            lorem.load(function (err, res) {
                if (err) return done(err);
                res.should.equal(lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 003');
                done();
            });
        });

        it('update doc from another place', function (done) {
            db.save({
                _id: id,
                name: 'Lorem 004'
            }, done);
        });

        it('can update to DB and handle conflict', function (done) {
            lorem.name('Lorem 005').save(function (err, res) {
                if (err) return done(err);
                res.should.be.instanceOf(Lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 004');
                done();
            });
        });

        it('can remove from DB', function (done) {
            lorem.remove(function (err, res) {
                if (err) return done(err);
                res.should.be.instanceOf(Lorem);
                res.primary().should.equal(id);
                res.name().should.equal('lorem 004');
                done();
            });
        });

        it('cannot read from DB', function (done) {
            lorem.load(function (err) {
                err.should.be.instanceOf(Error);
                err.should.have.property('status', 404);
                done();
            });
        });

        it('destroy DB', function (done) {
            db.destroy(done);
        });

    });

});
