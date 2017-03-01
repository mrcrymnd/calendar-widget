/* eslint-env es6 */
/* eslint-env node */

var propertiesString = function(properties) {
    var propString = '';
    for (var i in properties) {
        propString += '<span>' + i + ': </span>' + properties[i] + '</br>';
    }
    return propString;
};

var CTLEvent = function(event) {
    this.id = event.guid;
    this.title = event.summary;
    this.start = event.start_longdate;
    this.startTime = event.start_time;
    this.endTime = event.end_time;
    this.url = event.eventlink;
    this.description = event.description;
    this.location = event.location_address;

    this.category = [];
    this.type = [];
    this.eventsOpenTo = [];
    this.groupSpecific = [];
    this.campusLocation = [];

    var xprop = event.xproperties;
    if (!xprop) {
        xprop = [];
    }
    for (var i = 0; i < xprop.length; i++) {
        var aliasString;
        var propList;

        if (xprop[i]['X-BEDEWORK-ALIAS']) {
            aliasString = xprop[i]['X-BEDEWORK-ALIAS'].values.text;
            propList = aliasString.split('/').slice(-2);
            switch (propList[0]) {
                case 'Category':
                    this.category.push(propList[1]);
                    break;

                case 'Type':
                    this.type.push(propList[1]);
                    break;

                case 'Events open to':
                    this.eventsOpenTo.push(propList[1]);
                    break;

                case 'Group-Specific':
                    this.groupSpecific.push(propList[1]);
                    break;

                case 'Location':
                    this.campusLocation.push(propList[1]);
                    break;

                default:
                    break;
            }
        }
    }
};

CTLEvent.prototype.render = function() {
    return `
        <div class="event">
        <div class="event_specifics">
        <h3><a href="${this.url}">${this.title}</a></h3>
        <h4>${this.start} ${this.startTime} - ${this.startTime}</h4>
        </div>
        <div class="event_description"><p>${this.description}</p></div>
        <div class="location"><span class="event_location">Location: </span>${this.location}</div>
        <div class="event_properties">${ propertiesString(this.properties)}</div>
        </div>`;
};

if (typeof module !== 'undefined') {
    module.exports = { CTLEvent: CTLEvent };
}
