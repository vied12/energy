'use strict';

energyMap.$inject = ['markerService', 'imageOverlayService', 'leafletData', 'navService', '$timeout', '$window', '$state'];
function energyMap(markerService, imageOverlayService, leafletData, navService, $timeout, $window, $state) {
    function MapCtrl($scope) {
        var mv = this;
        $scope.map = {};
        var tiles_url = $window.TILES_URL;
        angular.extend($scope.map, {
            center: {
                lat: 0,
                lng: 0,
                zoom: 2
            },
            defaults: {
                tileLayer: tiles_url,
                zoomControlPosition: 'topright',
                attributionControl: false,
                tileLayerOptions: {
                    minZoom: 0,
                    maxZoom: 6,
                    attribution: 'ESO/INAF-VST/OmegaCAM',
                    continuousWorld: false,
                    noWrap: true,
                    tms: true,
                    crs: L.CRS.Simple,
                    detectRetina: false,
                    reuseTiles: true,
                },
                scrollWheelZoom: true
            },
        });

        // $scope.$watch('map.center', function(value) {
        //     navService.updateNavigationFromCoord(value);
        // });

        function updateMarkers() {
            leafletData.getMap().then(function (map) {
            markerService.markers.then(function(markers) {
                var markers_ = []
                markers
                .filter(function(marker) {
                    var limited_to_zoom = _.map(marker.limited_to_zoom, function(zoom) {
                        return parseInt(zoom);
                    });
                    return limited_to_zoom.indexOf(map.getZoom()) > -1;
                })
                .forEach(function(marker) {
                    if (marker.type === 'link' || marker.type === 'download') {
                        angular.extend(marker, {
                            draggable: $state.is("editor"),
                            icon: {
                                limited_to_zoom: marker.limited_to_zoom,
                                type: 'div',
                                html: $state.is("editor") ? '<div class="'+marker.type+'"></div>' : '<a href="'+marker.href+'" target="_blank"><div class="'+marker.type+'"></div></a>'
                            }
                        });
                        markers_.push(marker);
                    }
                });
                $scope.map.markers = markers_;
            });
            });
        }
        // add marker and update when needed
        updateMarkers();
        $scope.$on('markersUpdated', updateMarkers);
        $scope.$watch('map.markers', updateMarkers, true);

        // center and relayout on resize
        $scope.$on('resize', function resizeMap() {
            return leafletData.getMap().then(function (map) {
                map._onResize();
                navService.getCurrentBounds().then(function(bounds) {
                    $timeout(function() {
                        $scope.map.goTo(bounds);
                    }, 500);
                });
            });
        });

        var link_size = {
            4: 41 / 3,
            5: 41 / 2,
            6: 41
        }
        function onZoomChanged() {
            leafletData.getMap().then(function (map) {
                _.values(map._layers).forEach(function (layer) {
                    // hide/show imageOverlow
                    if (_.has(layer, '_image')) {
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
                    }
                    // resize links
                    if (_.has(layer.options, 'icon')) {
                        layer.setOpacity(1);
                        if (_.has(layer.options, 'size')) {
                            angular.element(layer._icon).find('div').css({width: layer.options.size[map.getZoom()], height: layer.options.size[map.getZoom()]});
                        } else {
                            angular.element(layer._icon).find('.link').css({width: link_size[map.getZoom()], height: link_size[map.getZoom()]});
                        }
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
        $scope.$on('leafletDirectiveMap.zoomend', updateMarkers);
        $scope.$on('leafletDirectiveMap.zoomend', onZoomChanged);
        $scope.$on('leafletDirectiveMap.zoomstart', hideMarker);
        $scope.$watch('map.markers', onZoomChanged, true);

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
                if ($state.is("editor")) {
                    rects.forEach(function(rect) {map.removeLayer(rect);});
                    var rect = L.rectangle([bounds.southWest, bounds.northEast], {
                        color: "#ff7800", weight: 3, fill:false
                    })
                    rect.addTo(map);
                    rects.push(rect);
                }
                map.fitBounds(L.latLngBounds(bounds.southWest, bounds.northEast), {paddingBottomRight:[0, 40]});
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
        if ($state.is("editor")) {
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
    .directive('energyMap', energyMap);
