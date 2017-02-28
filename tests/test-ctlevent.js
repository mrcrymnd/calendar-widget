/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var CTLEvent = require('../ctlevent.js').CTLEvent;
var fs = require('fs');

describe('CTLEvent', function() {
    var json = JSON.parse(fs.readFileSync('./tests/data.json', 'utf8'));
    var events = json.bwEventList.events;

    describe('constructor', function() {
        it('should not fail when given empty data', function() {
            new CTLEvent({});
        });
        it('loads data correctly', function() {
            var e = new CTLEvent(events[0]);
            assert.equal(e.id, events[0].guid);
            assert.equal(e.title, events[0].summary);
            assert.equal(e.start, events[0].start_longdate);
            assert.equal(e.startTime, events[0].start_time);
            assert.equal(e.endTime, events[0].end_time);
            assert.equal(e.url, events[0].eventlink);
            assert.equal(e.description, events[0].description);
            assert.equal(e.location, events[0].location_address);
            assert.deepEqual(e.category, ['Education']);
            assert.deepEqual(e.type, ['Workshop']);
            assert.deepEqual(e.eventsOpenTo, ['Faculty', 'Student']);
            assert.deepEqual(e.groupSpecific, ['Graduate Students']);
            assert.deepEqual(e.campusLocation, ['Medical Center']);
        });
    });
    describe('render', function() {
        it('should render the event correctly', function() {
            var e = new CTLEvent(events[0]);
            var rendered = e.render();
            assert.ok(rendered.indexOf(e.title) > -1);
        });
    });
});
