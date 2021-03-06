import Exposure from './exposure.js';

_.extend(Mongo.Collection.prototype, {
    expose(config) {
        if (!Meteor.isServer) {
            throw new Meteor.Error('not-allowed', `You can only expose a collection server side. ${this._name}`);
        }

        new Exposure(this, config);
    }
});