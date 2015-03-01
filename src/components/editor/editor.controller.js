'use strict';

function EditorCtrl($scope, markerService) {

    this.links = markerService.list;
    this.addNewLink = markerService.add;
    this.removeLink = markerService.remove;
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', EditorCtrl]);
