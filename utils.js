/* eslint-env node */

var CTLEventUtils = {};

/**
 * Given an array of all events and a search query,
 * return an array of search results.
 */
CTLEventUtils.filterEvents = function(allEvents, index, q) {
    var results = index.search(q);

    var searchResults = [];
    for (var r in results) {
        var e = allEvents[results[r].ref];
        searchResults.push(e);
    }

    return searchResults;
};

if (typeof module !== 'undefined') {
    module.exports = { CTLEventUtils: CTLEventUtils };
}
