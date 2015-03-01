'use strict';

function MapCtrl($scope, markerService, leafletData) {
    angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 3
        },
        maxBounds: {
            southWest: {lat: -85.05112877980659, lng: -179.82421875},
            northEast: {lat: -26.431228064506424, lng: 39.55078125}
        },
        defaults: {
            tileLayer: 'assets/tiles/{z}/{x}/{y}.png',
            zoomControlPosition: 'topright',
            tileLayerOptions: {
                minZoom: 0,
                maxZoom: 6,
                attribution: 'ESO/INAF-VST/OmegaCAM',
                continuousWorld: false,
                noWrap: true,
                tms: true,
                crs: L.CRS.Simple,
                detectRetina: true,
                reuseTiles: true,
            },
            scrollWheelZoom: true
        },
        markers: markerService.list
    });
    $scope.$on('resize', function resizeMap() {
        leafletData.getMap().then(function (map) {
            map._onResize();
        });
    });
    $scope.$on('leafletDirectiveMarker.dragend', function (event, marker) {
        // console.log('a', event);
        // console.log(marker.markerName);
        // $scope.markers[marker.markerName]
    });
    $scope.$on('leafletDirectiveMap.click', function (event, b) {
        $scope.lastClick = b.leafletEvent;
    });
    // function reloadLabel() {
    //     $scope.labels.forEach(function (label) {
    //         $scope.markers[label.$$hashKey] = {
    //             lat: label.latlng.lat,
    //             lng: label.latlng.lng,
    //             focus: true,
    //             draggable: true,
    //             icon: {
    //                 type: 'div',
    //                 html: label.label,
    //                 // popupAnchor:  [0, 0]
    //                 // iconSize: [230, 0],
    //             }
    //         };
    //     });
    // }
    // $scope.$watch('labels', reloadLabel, true);

}
angular.module('energy')
    .controller('MapCtrl', ['$scope', 'markerService', 'leafletData', MapCtrl]);
