'use strict';

function EditorCtrl($scope, markerService) {
    this.links = markerService.list;
    this.addLink = function (label) {
        markerService.add({
            label: label,
            lat: -69.7181066990676,
            lng: -35.244140625,
            draggable: true,
            icon: {
                type: 'div',
                html: label.label
            }
        });
    };
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', EditorCtrl]);
