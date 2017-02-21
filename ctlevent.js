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

        if (xprop[i]["X-BEDEWORK-ALIAS"]) {
            aliasString = xprop[i]["X-BEDEWORK-ALIAS"].values.text;
            propList = aliasString.split("/").slice(-2);
            switch (propList[0]) {
                case "Category":
                    category.push(propList[1]);
                    break;

                case "Type":
                    type.push(propList[1]);
                    break;

                case "Events open to":
                    eventsOpenTo.push(propList[1]);
                    break;

                case "Group-Specific":
                    groupSpecific.push(propList[1]);
                    break;

                case "Location":
                    campusLocation.push(propList[1]);
                    break;

                default:
                    console.log('data skipped:', xprop[i]);
                    break;
            }
        }
    }
};

module.exports = { CTLEvent: CTLEvent };
