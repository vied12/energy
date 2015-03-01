'use strict';

function markerService() {
    var labels = [];
    var counter = 1;
    return {
        list: labels,
        add: function (label) {
            label = label || 'New link ' + counter;
            labels.push({
                lat: -69.7181066990676,
                lng: -35.244140625,
                draggable: true,
                icon: {
                    className: 'label',
                    type: 'div',
                    html: label
                }
            });
            counter++;
        },
        remove: function (label) {
            var index = labels.indexOf(label);
            if (index > -1) {
                labels.splice(index, 1);
            }
        }
    };
}

angular.module('energy')
    .service('markerService', markerService);