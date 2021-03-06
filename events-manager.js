/* eslint-env node */
/* global jQuery */

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

CTLEventsManager.renderLocationDropdown = function() {
    var $container = jQuery(
        '<select id="location-dropdown">' +
            '<option value="null">Location: All</option>' +
            '</select>');

    var locations = [];
    CTLEventsManager.allEvents.forEach(function(e) {
        var loc = e.getCampusLocation();
        if (locations.indexOf(loc) === -1) {
            locations.push(loc);
        }
    });

    locations.forEach(function(e) {
        $container.append(
            '<option value="' + e + '">' + e + '</option>');
    });

    return $container;
};

CTLEventsManager.renderAudienceDropdown = function() {
    var $container = jQuery(
        '<select id="audience-dropdown">' +
            '<option value="null">Audience: All</option>' +
            '</select>');

    var allAudiences = [];
    CTLEventsManager.allEvents.forEach(function(e) {
        var audiences = e.getAudience();
        audiences.forEach(function (audience) {
            if (allAudiences.indexOf(audience) === -1) {
                allAudiences.push(audience);
            }
        });
    });

    allAudiences.forEach(function(e) {
        $container.append(
            '<option value="' + e + '">' + e + '</option>');
    });

    return $container;
};

if (typeof module !== 'undefined') {
    module.exports = { CTLEventsManager: CTLEventsManager };
}
