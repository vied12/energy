'use strict';

function EditorCtrl($scope, markerService, $window) {
    var vm = this;
    markerService.markers.then(function(markers) {
        vm.markers = markers;
    });
    vm.addNewLink = markerService.add.bind(null, 'link');
    vm.removeLink = markerService.remove;
    // vm.zoneSelected = [];
    // vm.selectZone = function (e,b) {
    //     angular.element($window).bind('click', function (e,b){
    //         console.log(e,b);
    //     });

    // }
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', '$window', EditorCtrl]);
