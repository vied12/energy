'use strict';

function energyMap(markerService, leafletData, navService, $timeout) {
    function MapCtrl($scope) {
        var mv = this;
        $scope.map = {};
        var tiles_url = window.TILES_URL;
        angular.extend($scope.map, {
            center: {
                lat: 0,
                lng: 0,
                zoom: 2
            },
            defaults: {
                tileLayer: tiles_url,
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
                navService.getCurrentBounds().then(function(bounds) {
                    // $scope.map.goTo(bounds);
                    $timeout(function(){$scope.map.goTo(bounds);});
                });
            });
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
                });
            }); 
        }

        $scope.$watch('map.markers', hideAndShowMarker, true);
        $scope.$on('leafletDirectiveMap.zoomend', hideAndShowMarker);

        function styleMarkers() {
            leafletData.getMap().then(function (map) {
                _.values(map._layers).forEach(function (layer) {
                    if (_.has(layer.options, 'icon')) {
                        if (_.has(layer.options.icon.options, 'style')) {
                            angular.element(layer._icon).css(layer.options.icon.options.style);
                        }
                    }
                });
            });
        }
        $scope.$watch('markers', styleMarkers, true);

        var rects = [];
        $scope.map.goTo = function (bounds) {
            leafletData.getMap().then(function (map) {
                rects.forEach(function(rect) {map.removeLayer(rect);});
                var rect = L.rectangle([bounds.southWest, bounds.northEast], {
                    color: "#ff7800", weight: 3, fill:false
                })
                rect.addTo(map);
                rects.push(rect);
                map.fitBounds(L.latLngBounds(bounds.southWest, bounds.northEast));
            });
        };
        $scope.$on('boundsSelected', function(e, bounds) {
            return $scope.map.goTo(bounds);
        });

        // debug
        $scope.map._selectedZone = [];
        $scope.$on('leafletDirectiveMap.click', function(a,b) {
            var point = b.leafletEvent.latlng;
            if ($scope.map._selectedZone.length < 2) {
                $scope.map._selectedZone.push(point);
            } else {
                $scope.map._selectedZone = [];
            }
        });

    }
    return {
        restrict: 'E',
        controller: MapCtrl,
        scope: {
            'map' : '='
        },
        templateUrl: 'components/map/map.html'
    }
}
angular.module('energy')
    .directive('energyMap', ['markerService', 'leafletData', 'navService', '$timeout', energyMap]);
