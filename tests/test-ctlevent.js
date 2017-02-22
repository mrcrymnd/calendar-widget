var assert = require('assert');
var CTLEvent = require('../ctlevent.js').CTLEvent;
var fs = require('fs');

describe('CTLEvent', function() {
    var json = JSON.parse(fs.readFileSync('./tests/data.json', 'utf8'));
    var events = json.bwEventList.events;

    describe('constructor', function() {
        it('should not fail when given empty data', function() {
            var e = new CTLEvent({});
        });
        it('loads data correctly', function() {
            var e = new CTLEvent(events[0]);
            assert.equal(e.id, events[0].guid);
            assert.equal(e.start, events[0].start_longdate);
        });
    });
});
