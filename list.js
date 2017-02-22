(function() {
    var events = [];

    var renderEvents = function(events) {
        var markup = '';
        var e;
        events.forEach(function(eventData) {
            e = new CTLEvent(eventData);
            events.push(e);

            // TODO: move rendering somewhere else - needs to be controlled by pagination.
            markup += e.render();
        });

        jQuery('#calendarList').append(markup);

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
                renderEvents(data.bwEventList.events);
            },
            error: function(e) {
                alert('Bad ajax call', e);
            }
        })
    });
})();

