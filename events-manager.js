/* eslint-env node */

if (typeof require === 'function') {
    var CTLEvent = require('./ctlevent.js').CTLEvent;
}

var CTLEventsManager = {};

CTLEventsManager.allEvents = [];
CTLEventsManager.filteredEvents = [];

/**
 * Takes an array of events from JSON, and initializes a CTLEvent
 * instance for each one. This also indexes these items with the
 * given search index.
 *
 * Returns the array of CTLEvents.
 */
CTLEventsManager.loadEvents = function(eventsJson, searchIndex) {
    var i = 0;
    var events = [];

    eventsJson.forEach(function(eventData) {
        var e = new CTLEvent(eventData);
        events.push(e);

        // build lunr index
        searchIndex.add({
            id: i++,
            title: e.title,
            description: e.description
        });
    });

    return events;
};

if (typeof module !== 'undefined') {
    module.exports = { CTLEventsManager: CTLEventsManager };
}
