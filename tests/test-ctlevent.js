var assert = require('assert');
var CTLEvent = require('../ctlevent.js');

describe('CTLEvent', function() {
    describe('constructor', function() {
        console.log(CTLEvent.CTLEvent);
        it('should not fail when given empty data', function() {
            var e = CTLEvent.CTLEvent({});
        });
        it('loads data correctly', function() {
            var json = {};
            var e = CTLEvent.CTLEvent(json);
            assert.equal(e.id, json['id']);
            assert.equal(e.start, json['id']);
        });
    });
});
