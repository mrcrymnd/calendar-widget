/* global jQuery */
/* global lunr */
/* global CTLEventUtils, CTLEventsManager */

(function($) {

    var ITEMS_ON_PAGE = 6;

    var index = lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('description', {boost: 5});
    });

    var doSearch = function(events) {
        var $el = $('#calendarList');
        var q = $('#q').val();

        $el.empty();
        $el.show();
        $el.append('<div class="arrow"></div>');
        $el.append($('<h2>Results for: "' + q + '"</h2>'));

        CTLEventsManager.filteredEvents = CTLEventUtils.searchEvents(
            events, index, q);
        if (CTLEventsManager.filteredEvents.length === 0) {
            $el.append('<div class="q-no-item">Unfortunately, there are ' +
                    'no results matching what you\'re looking for.</div>');
        } else {
            refreshEvents(CTLEventsManager.filteredEvents, 1);
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
        CTLEventsManager.allEvents = CTLEventsManager.loadEvents(eventsJson, index);

        $('.pagination-holder').pagination({
            items: CTLEventsManager.allEvents.length,
            itemsOnPage: ITEMS_ON_PAGE,
            cssStyle: 'ctl-theme',
            onPageClick: function(pageNumber) {
                if (CTLEventsManager.filteredEvents.length > 0 || $('#q').val().length > 1) {
                    refreshEvents(CTLEventsManager.filteredEvents, pageNumber);
                } else {
                    refreshEvents(CTLEventsManager.allEvents, pageNumber);
                }
            }
        });

        // Initialize the location dropdown
        var $el = $('#location-dropdown-container');
        $el.append(CTLEventsManager.renderLocationDropdown());
        $el.find('select#location-dropdown').on('change', function(e) {
            var loc = e.target.value;

            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByLocation(
                    CTLEventsManager.allEvents, loc);
            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });

        $('input[name="start_date"]').on('change', function(e) {
            var date = e.target.value;
            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByDateRange(
                    CTLEventsManager.allEvents,
                    date ? new Date(date + ' 00:00:00 GMT-0500') : null,
                    null);
            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });
        $('input[name="end_date"]').on('change', function(e) {
            var date = e.target.value;
            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByDateRange(
                    CTLEventsManager.allEvents,
                    null,
                    date ? new Date(date + ' 00:00:00 GMT-0500') : null);
            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });

        refreshEvents(CTLEventsManager.allEvents, 1);
    };

    $(document).ready(function() {
        var boilerplate =  '<div class="pagination-holder"></div>' +
            '<div class="search-wrapper">' +
            '<form role="search">' +
            '<input id="q" type="text" required="" class="search-box" ' +
            'placeholder="I\'m searching for...">' +
            '<button class="close-icon" id="clear-search" type="reset">' +
            'Reset</button>' +
            '</form>' +

            '<div id="location-dropdown-container"></div>' +

            '<label>From: ' +
            '<input name="start_date" />' +
            '</label>' +

            '<label>To: ' +
            '<input name="end_date" />' +
            '</label>' +

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

        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            $('#calendarList').empty();

            if ($(this).val().length < 2) {
                refreshEvents(CTLEventsManager.allEvents, 1);
                return;
            }
            return doSearch(CTLEventsManager.allEvents);
        });
    });
})(jQuery);
