'use strict';

function EditorCtrl($scope, markerService) {
    this.links = markerService.list;
    this.addLink = function (label) {
        markerService.add({
            'label': label,
            'latlng': {'lat': -69.7181066990676, 'lng': -35.244140625}
        });
    };
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', EditorCtrl]);
