'use strict';

function markerService() {
    var markers = [];
    var counter_for_label = 1;
    return {
        list: markers,
        add: function (label) {
            label = label || 'New link ' + counter_for_label;
            markers.push({
                lat: -69.7181066990676,
                lng: -35.244140625,
                draggable: true,
                icon: {
                    limited_to_zoom: [3],
                    style: {
                        color: 'red'
                    },
                    type: 'div',
                    html: label
                }
            });
            counter_for_label++;
        },
        remove: function (label) {
            var index = markers.indexOf(label);
            if (index > -1) {
                markers.splice(index, 1);
            }
        }
    };
}

angular.module('energy')
    .service('markerService', markerService);