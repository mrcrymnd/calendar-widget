(function() {
    var events = [];
    var ITEMS_ON_PAGE = 6;

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
    }

    /**
     * Clear the events from the DOM and re-render them.
     */
    var refreshEvents = function(eArray, pageNum) {
        jQuery('.ctl-events').remove();
        jQuery('#calendarList').append(renderEvents(eArray, pageNum));
    };

    /**
     * @param events: JSON event object fetched from Bedeworks
     */
    var initializeEventsPage = function(eventsJson) {
        // build events map
        var e;
        eventsJson.forEach(function(eventData) {
            e = new CTLEvent(eventData);
            events.push(e)
        });

        $('.pagination-holder').pagination({
            items: events.length,
            itemsOnPage: ITEMS_ON_PAGE,
            cssStyle: 'ctl-theme',
            onPageClick: function(pageNumber) {
                refreshEvents(events, pageNumber);
            }
        });

        refreshEvents(events, 1);
    };

    jQuery(document).ready(function(){
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
            },
            error: function(e) {
                alert('Bad ajax call', e);
            }
        })
    });
})();
