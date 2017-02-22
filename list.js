(function() {
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
            success: function(data){

                var markup = '';
                var e;
                for (let event of data.bwEventList.events) {
                    e = new CTLEvent(event);
                    markup += e.render();
                }

                jQuery('#calendarList').append(markup);
            },
            error: function() {
                alert('Bad ajax call');
            }
        })
    })
})();

