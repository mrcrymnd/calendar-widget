(function() {
    var eventsMap = new Map();

    var renderAllEvents = function(eventMap) {
        var markup = [];
        eventMap.forEach(function(value, key, map) {
            markup.push(value.render());
        });
        return markup.join();
    }

    /**
     * @param events: JSON event object fetched from Bedeworks
     */
    var initializeEventsPage = function(events) {
        // build events map
        var e;
        events.forEach(function(eventData) {
            e = new CTLEvent(eventData);
            eventsMap.set(e.id, e);
        });


        jQuery('#calendarList').append(renderAllEvents(eventsMap));

        $('.pagination-holder').pagination({
            items: 100,
            itemsOnPage: 10,
            cssStyle: 'light-theme'
        });
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

