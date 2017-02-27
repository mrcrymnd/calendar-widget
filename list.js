(function() {
    var events = [];
    var ITEMS_ON_PAGE = 6;

    var index = lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('description', {boost: 5});

    });

    var doSearch = function() {
        var q = $('#q').val();
        var results = index.search(q);
        var $el = $('#calendarList');
        $el.empty();
        $el.show();
        $el.append('<div class="arrow"></div>');
        $el.append(
            $('<h2>RESULTS FOR: "' + q + '"</h2>')
        );
        if (results.length === 0) {
            $el.append('<div class="q-no-item">Unfortunately, there are ' +
                'no results matching what you\'re looking for in ' +
                'the Columbia Film Glossary content.</div>');
        } else {
            var searchResults = [];
            for (var r in results) {
                var e = events[results[r].ref];
                searchResults.push(e);
            }
            refreshEvents(searchResults, 1);
        }
        return false;
    };

    var clearSearch = function() {
        $('#calendarList').empty();
        $('#calendarList').hide();

    };

    $(document).ready(function() {
        $('#search').click(doSearch);
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            $('#calendarList').empty();
            if ($(this).val().length < 2) {
                $('#calendarList').hide();
                return;
            }
            return doSearch();
        });
    });

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
        console.log("refreshing events")
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
            events.push(e)

            // build lunr index
            index.add({
                id: i++,
                title: e.title,
                description: e.description
            });
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
