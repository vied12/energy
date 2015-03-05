'use strict';

function EditorCtrl($scope, markerService, $window) {
    this.links = markerService.list;
    this.addNewLink = markerService.add;
    this.removeLink = markerService.remove;
    this.zoneSelected = [];
    this.selectZone = function (e,b) {
        angular.element($window).bind('click', function (e,b){
            console.log(e,b);
        });

    }
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', '$window', EditorCtrl]);
