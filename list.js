/* global jQuery */
/* global lunr */
/* global CTLEvent */

(function($) {
    var ALL_EVENTS = [];
    var FILTERED_EVENTS = [];

    var ITEMS_ON_PAGE = 6;

    var index = lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('description', {boost: 5});
    });

    /**
     * Given an array of all events and a search query,
     * return an array of search results.
     */
    var filterEvents = function(allEvents, q) {
        var results = index.search(q);

        var searchResults = [];
        for (var r in results) {
            var e = allEvents[results[r].ref];
            searchResults.push(e);
        }

        return searchResults;
    };

    var doSearch = function(events) {
        var $el = $('#calendarList');
        var q = $('#q').val();

        $el.empty();
        $el.show();
        $el.append('<div class="arrow"></div>');
        $el.append(
            $('<h2>Results for: "' + q + '"</h2>')
        );

        FILTERED_EVENTS = filterEvents(events, q);
        if (FILTERED_EVENTS.length === 0) {
            $el.append('<div class="q-no-item">Unfortunately, there are ' +
                'no results matching what you\'re looking for in ' +
                'the Columbia Film Glossary content.</div>');
        } else {
            refreshEvents(FILTERED_EVENTS, 1);
        }
        return false;
    };

    var clearSearch = function() {
        $('#calendarList').empty();
        $('#calendarList').hide();
    };

    /**
     * Generate an element containing all the events that belong on
     * the given page number.
     */
    var renderEvents = function(eArray, pageNum) {
        var $container = jQuery('<div class="ctl-events" />');
        var start = (pageNum - 1) * ITEMS_ON_PAGE;
        var end = start + ITEMS_ON_PAGE;
        for (var i = start; i < end && i < eArray.length; i++) {
            $container.append(jQuery(
                eArray[i].render()
            ));
        }
        return $container;
    };

    /**
     * Clear the events from the DOM and re-render them.
     */
    var refreshEvents = function(eArray, pageNum) {
        $('.pagination-holder').pagination('updateItems', eArray.length);
        jQuery('.ctl-events').remove();
        jQuery('#calendarList').append(renderEvents(eArray, pageNum));
    };

    /**
     * @param events: JSON event object fetched from Bedeworks
     */
    var initializeEventsPage = function(eventsJson) {
        // build events map
        var e;
        var i = 0;

        eventsJson.forEach(function(eventData) {
            e = new CTLEvent(eventData);
            ALL_EVENTS.push(e);

            // build lunr index
            index.add({
                id: i++,
                title: e.title,
                description: e.description
            });
        });

        $('.pagination-holder').pagination({
            items: ALL_EVENTS.length,
            itemsOnPage: ITEMS_ON_PAGE,
            cssStyle: 'ctl-theme',
            onPageClick: function(pageNumber) {
                if (FILTERED_EVENTS.length > 0 || $('#q').val().length > 1) {
                    refreshEvents(FILTERED_EVENTS, pageNumber);
                } else {
                    refreshEvents(ALL_EVENTS, pageNumber);
                }
            }
        });

        refreshEvents(ALL_EVENTS, 1);
    };

    jQuery(document).ready(function(){
        var boilerplate =  '<div class="pagination-holder"></div>' +
                            '<div class="search-wrapper">' +
                                '<form role="search">' +
                                    '<input id="q" type="text" required="" class="search-box" placeholder="I\'m searching for...">' +
                                    '<button class="close-icon" id="clear-search" type="reset">Reset</button>' +
                                    '<button type="submit" id="search" style="display:none;">Search</button>' +
                                '</form>' +
                                '<div id="search-results"></div>' +
                            '</div>' +
                            '<div id="calendarList"></div>' +
                            '<div class="pagination-holder"></div>';

        jQuery('#calendar-wrapper').append(boilerplate);

        jQuery.ajax({
            url: 'https://cdn.cul.columbia.edu/ldpd-toolkit/api/events-bw-prox-v2.json.php',
            type: 'GET',
            data: {
                // This is part of a call to a php proxy used by CUL
                burl: 'https://events.columbia.edu/feeder/main/eventsFeed.do',
                f: 'y',
                sort: 'dtstart.utc:asc',
                fexpr: '(categories.href=\"/public/.bedework/categories/org/centertla\")',
                skinName: 'list-json',
                count: 200
            },
            dataType: 'json',
            success: function(data) {
                initializeEventsPage(data.bwEventList.events);
            }
        });

        $('#search').click(function() {
            doSearch(ALL_EVENTS);
        });
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            $('#calendarList').empty();

            if ($(this).val().length < 2) {
                refreshEvents(ALL_EVENTS, 1);
                return;
            }
            return doSearch(ALL_EVENTS);
        });
    });
})(jQuery);
