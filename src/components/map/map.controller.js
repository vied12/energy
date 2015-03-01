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
    // $scope.$on('leafletDirectiveMarker.dragend', function (event, marker) {
    //     // console.log('a', event);
    //     console.log(marker.leafletEvent);
    //     var el = angular.element(marker.leafletEvent.target._icon);
    //     el.css({color: 'red'});
    //     // $scope.markers[marker.markerName]
    //     // marker.setStyle({color: 'red'});
    // });
    $scope.$on('leafletDirectiveMap.click', function (event, b) {
        $scope.lastClick = b.leafletEvent;
    });

    function hideAndShowMarker() {
        leafletData.getMap().then(function (map) {
            _.values(map._layers).forEach(function (layer) {
                if (_.has(layer.options, 'icon')) {
                    if (_.has(layer.options.icon.options, 'limited_to_zoom') && layer.options.icon.options.limited_to_zoom.length > 0) {
                        var limited_to_zoom = _.map(layer.options.icon.options.limited_to_zoom, function(zoom) {
                            return parseInt(zoom);
                        });
                        if (limited_to_zoom.indexOf(map.getZoom()) > -1) {
                            layer.setOpacity(1);
                        } else {
                            layer.setOpacity(0);
                        }
                    } else {
                        layer.setOpacity(1);
                    }
                }
            })
        }); 
    }

    $scope.$watch('markers', hideAndShowMarker, true);
    $scope.$on('leafletDirectiveMap.zoomend', hideAndShowMarker);

}
angular.module('energy')
    .controller('MapCtrl', ['$scope', 'markerService', 'leafletData', MapCtrl]);
