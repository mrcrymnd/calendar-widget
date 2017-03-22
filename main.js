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
        CTLEventUtils.updateURL('q', q);

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
        // remove query string from url
        CTLEventUtils.clearURLParams();
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

            if (loc && loc !== 'null') {
                CTLEventUtils.updateURL('loc', loc);
            } else {
                CTLEventUtils.unsetURLParams('loc');
            }

            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });

        // Initialize the audience dropdown
        $el = $('#audience-dropdown-container');
        $el.append(CTLEventsManager.renderAudienceDropdown());
        $el.find('select#audience-dropdown').on('change', function(e) {
            var audience = e.target.value;

            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByAudience(
                    CTLEventsManager.allEvents, audience);

            if (audience && audience !== 'null') {
                CTLEventUtils.updateURL('audience', audience);
            } else {
                CTLEventUtils.unsetURLParams('audience');
            }

            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });

        var $startInput = $('input[name="start_date"]');
        $startInput.on('change', function(e) {
            var date = e.target.value;
            var startDate = date ? new Date(date + ' 00:00:00 GMT-0500') : null;

            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByDateRange(
                    CTLEventsManager.allEvents, startDate, null);

            if (startDate) {
                CTLEventUtils.updateURL(
                    'start', CTLEventUtils.formatShortDate(startDate));
            }
            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });
        $startInput.datepicker();

        var $endInput = $('input[name="end_date"]');
        $endInput.on('change', function(e) {
            var date = e.target.value;
            var endDate = date ? new Date(date + ' 00:00:00 GMT-0500') : null;

            CTLEventsManager.filteredEvents =
                CTLEventUtils.filterEventsByDateRange(
                    CTLEventsManager.allEvents, null, endDate);

            if (endDate) {
                CTLEventUtils.updateURL(
                    'end', CTLEventUtils.formatShortDate(endDate));
            }
            refreshEvents(CTLEventsManager.filteredEvents, 1);
        });
        $endInput.datepicker();

        var queryString = window.location.search.replace(/^\?/, '');
        var filteredEvents = CTLEventUtils.readURLParams(CTLEventsManager.allEvents, queryString, index);

        refreshEvents(filteredEvents, 1);
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

            '<div id="audience-dropdown-container"></div>' +

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
