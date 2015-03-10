'use strict';

function markerService() {
    var markers = [];
    var counter_for_label = 1;
    return {
        list: markers,
        add: function (type, label) {
            if (type === 'text') {
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
            } else if (type === 'link') {
                markers.push({
                    lat: 49.83798245308484,
                    lng: -38.232421875,
                    // draggable: true,
                    icon: {
                        limited_to_zoom: [4,5,6],
                        type: 'div',
                        html: '<a href="http://google.fr" target="_blank"><div class="link"></div></a>',
                    }
                });
            }
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