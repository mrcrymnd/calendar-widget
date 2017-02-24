(function() {
    var index = lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('description', {boost: 5});

    });

    var doSearch = function() {
        var q = $('#q').val();
        var results = index.search(q);
        var $el = $('#search-results');
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
            for (var r in results) {
                var e = eventsMap.get(results[r].ref);
                var $result = $('<div class="q-item">');
                $result.append(e.render());
                $el.append($result);
            }
        }
        return false;
    };

    var clearSearch = function() {
        $('#search-results').empty();
        $('#search-results').hide();

    };

    $(document).ready(function() {
        $('#search').click(doSearch);
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            $('#search-results').empty();
            if ($(this).val().length < 2) {
                $('#search-results').hide();
                return;
            }
            return doSearch();
        });
    });

    var eventsMap = new Map();

    var renderEvents = function(events) {
        var markup = '';
        var e;
        events.forEach(function(eventData) {
            e = new CTLEvent(eventData);
            eventsMap.set(e.id, e);
            // build lunr index
            index.add({
                id: e.id,
                title: e.title,
                description: e.description
            });

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

