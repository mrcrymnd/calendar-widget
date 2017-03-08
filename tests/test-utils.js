/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var CTLEventUtils = require('../utils.js').CTLEventUtils;
var CTLEventsManager = require('../events-manager.js').CTLEventsManager;
var fs = require('fs');
var lunr = require('lunr');

describe('filterEvents', function() {
    var json = JSON.parse(fs.readFileSync('./tests/data.json', 'utf8'));
    var events = json.bwEventList.events;

    var index = lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('description', {boost: 5});
    });

    var allEvents = CTLEventsManager.loadEvents(events, index);

    it('filters events accurately', function() {
        assert.deepEqual(CTLEventUtils.filterEvents(allEvents, index, 'test'), []);
        assert.equal(CTLEventUtils.filterEvents(allEvents, index, 'Media').length, 3);
    });
});

describe('findIndex', function() {
    it('accepts an empty array', function() {
        var i = CTLEventUtils.findIndex([], function(e) {
            return e === 6;
        });
        assert.equal(i, -1);
    });

    it('returns an accurate index', function() {
        var i = CTLEventUtils.findIndex([1, 2, 6, 3], function(e) {
            return e === 6;
        });
        assert.equal(i, 2);

        i = CTLEventUtils.findIndex([1, 2, 6, 3], function(e) {
            return e === 66;
        });
        assert.equal(i, -1);
    });
});
