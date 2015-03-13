'use strict';

function energyMap(markerService, imageOverlayService, leafletData, navService, $timeout) {
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
        });

        function updateMarkers() {
            markerService.markers.then(function(markers) {
                markers.forEach(function(marker) {
                    if (marker.type === 'link') {
                        angular.extend(marker, {
                            draggable: true,
                            icon: {
                                limited_to_zoom: [4,5,6],
                                type: 'div',
                                html: '<div class="link"></div>',
                                // html: '<a href="'+marker.href+'" target="_blank"><div class="link"></div></a>',
                            }
                        });
                    }
                });
                $scope.map.markers = markers;
            });
        }
        // add marker and update when needed
        updateMarkers();
        $scope.$on('markersUpdated', updateMarkers);

        // center and relayout on resize
        $scope.$on('resize', function resizeMap() {
            leafletData.getMap().then(function (map) {
                map._onResize();
                navService.getCurrentBounds().then(function(bounds) {
                    // $scope.map.goTo(bounds);
                    $timeout(function() {
                        $scope.map.goTo(bounds);
                    });
                });
            });
        });

        function onZoomChanged() {
            leafletData.getMap().then(function (map) {
                _.values(map._layers).forEach(function (layer) {
                    if (_.has(layer.options, 'icon') || _.has(layer, 'limited_to_zoom')) {
                        var limits = layer.limited_to_zoom || layer.options.icon.options.limited_to_zoom;
                        if (limits.length > 0) {
                            var limited_to_zoom = _.map(limits, function(zoom) {
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
                        // FIXME: only for links
                        var new_size = {
                            4: 109 / 2,
                            5: 109,
                            6: 109 * 2
                        }
                        angular.element(layer._icon).find('.link').css({width: new_size[map.getZoom()], height: new_size[map.getZoom()]});
                    }
                });
            }); 
        }

        function hideMarker() {
            leafletData.getMap().then(function (map) {
                _.values(map._layers).forEach(function (layer) {
                    if (_.has(layer.options, 'icon')) {
                        layer.setOpacity(0);
                    }
                });
            }); 
        }
        $scope.$watch('map.markers', onZoomChanged, true);
        $scope.$on('leafletDirectiveMap.zoomend', onZoomChanged);
        $scope.$on('leafletDirectiveMap.zoomstart', hideMarker);

        // function styleMarkers() {
        //     leafletData.getMap().then(function (map) {
        //         _.values(map._layers).forEach(function (layer) {
        //             if (_.has(layer.options, 'icon')) {
        //                 if (_.has(layer.options.icon.options, 'style')) {
        //                     angular.element(layer._icon).css(layer.options.icon.options.style);
        //                 }
        //             }
        //         });
        //     });
        // }
        // $scope.$watch('markers', styleMarkers, true);

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

        // image overlays
        imageOverlayService.imageOverlays.then(function(imageOverlays) {
            leafletData.getMap().then(function (map) {
                imageOverlays.forEach(function(imageOverlay) {
                    var bounds = [imageOverlay.bounds.southWest, imageOverlay.bounds.northEast];
                    var layer = L.imageOverlay(imageOverlay.href, bounds);
                    layer.limited_to_zoom = imageOverlay.limited_to_zoom;
                    layer.addTo(map);
                });
            });
        });

        // debug
        $scope.map._selectedZone = [];
        $scope.$on('leafletDirectiveMap.click', function(a,b) {
            var point = b.leafletEvent.latlng;
            if ($scope.map._selectedZone.length < 2) {
                $scope.map._selectedZone.push(point);
                var point1 = $scope.map._selectedZone[0];
                var point2 = $scope.map._selectedZone[1];
                var rect = L.rectangle([point1, point2], {
                    color: "#ff7800", weight: 3, fill:false
                });
                leafletData.getMap().then(function (map) {
                    rect.addTo(map);
                });
                rects.push(rect);
            } else {
                $scope.map._selectedZone = [];
            }
        });
        $scope.$on('leafletDirectiveMarker.click', function(e, args) {
            $scope.map.markerIndexSelected = args.markerName;
        });
        document.onkeydown = function(e) {
                e = e || window.event;
                if (angular.isDefined($scope.map.markerIndexSelected)) {
                    if (e.keyCode == '38') {
                        // up arrow
                        markerService.markers.then(function(markers) {
                            markers[$scope.map.markerIndexSelected].lat += 0.1;
                        });
                    }
                    else if (e.keyCode == '40') {
                        // down arrow
                        markerService.markers.then(function(markers) {
                            markers[$scope.map.markerIndexSelected].lat -= 0.1;
                        });
                    }
                    else if (e.keyCode == '37') {
                       // left arrow
                       markerService.markers.then(function(markers) {
                            markers[$scope.map.markerIndexSelected].lng -= 0.1;
                        });
                    }
                    else if (e.keyCode == '39') {
                       // right arrow
                       markerService.markers.then(function(markers) {
                            markers[$scope.map.markerIndexSelected].lng += 0.1;
                        });
                    }
                }
        };

    }
    return {
        restrict: 'E',
        controller: MapCtrl,
        replace: true,
        scope: {
            'map' : '='
        },
        templateUrl: 'components/map/map.html'
    }
}
angular.module('energy')
    .directive('energyMap', ['markerService', 'imageOverlayService', 'leafletData', 'navService', '$timeout', energyMap]);
