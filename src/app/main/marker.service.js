'use strict';

function markerService() {
    var labels = [];
    return {
        list: labels,
        add: function (label) {
            console.log('add', label);
            labels.push(label);
        }
    };
}

angular.module('energy')
    .service('markerService', markerService);