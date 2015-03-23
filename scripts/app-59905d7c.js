'use strict';

angular
    .module('energy', ['ngCookies', 'ngTouch', 'ui.router', 'ui.bootstrap', 'leaflet-directive'])
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            })
            .state('editor', {
                controller: ['$scope', 'navService', 'markerService', function($scope, navService, markerService) {
                    navService.steps.then(function(steps) {
                        $scope.steps = steps;
                        markerService.markers.then(function(markers) {
                            $scope.markers = markers;
                        });
                    });
                }],
                url: '/editor',
                templateUrl: 'app/editor/editor.html'
            });
        $urlRouterProvider.otherwise('/');
    }])
    .filter('btoa', function() {
        return function(input) {
            return btoa(input);
        };
    })
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {   
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data:application)/);
            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
    ]);

function energyNavigation($http, navService) {
    function navigationController($scope) {
        var vm = this;
        vm.previous = navService.previous;
        vm.next = navService.next;
        vm.info = navService.info;
        vm.goTo = navService.goTo;
        navService.steps.then(function(steps) {
            vm.steps = steps;
        });
    }
    return {
        restrict: 'E',
        templateUrl: 'components/navigation/view.html',
        replace: true,
        scope: true,
        controller: navigationController,
        controllerAs: 'nav'
    }
}

navService.$inject = ['$http', '$rootScope'];
function navService($http, $rootScope) {
    var info = {stepIndex: 0};
    var steps = $http.get('assets/data/steps.json').then(function(response){return response.data.steps});
    var currentBounds;

    function goTo(i) {
        info.stepIndex = i;
        return steps.then(function(steps) {
            currentBounds = steps[i].bounds;
            $rootScope.$broadcast('boundsSelected', currentBounds);
        });
    }

    function next() {
        return steps.then(function(steps) {
            if (info.stepIndex < steps.length - 1) {
                goTo(info.stepIndex + 1);
            }
        });
    }

    function previous() {
        return steps.then(function(steps) {
            if (info.stepIndex > 0) {
                goTo(info.stepIndex - 1);
            }
        });
    }

    function getCurrentBounds() {
        return steps.then(function(steps) {
            return steps[info.stepIndex].bounds;
        });
    }

    return {
        next: next,
        previous: previous,
        getCurrentBounds: getCurrentBounds,
        goTo: goTo,
        info: info,
        steps: steps
    }
}

angular.module('energy')
    .directive('energyNavigation', ['$http', 'navService', energyNavigation])
    .service('navService', navService);

// EOF

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

'use strict';

function EditorCtrl($scope, markerService, $window) {
    var vm = this;
    markerService.markers.then(function(markers) {
        vm.markers = markers;
    });
    vm.addNewLink = markerService.add.bind(null, 'link');
    vm.removeLink = markerService.remove;
    vm.zoneSelected = [];
    vm.selectZone = function (e,b) {
        angular.element($window).bind('click', function (e,b){
            console.log(e,b);
        });

    }
}

angular.module('energy')
    .controller('EditorCtrl', ['$scope', 'markerService', '$window', EditorCtrl]);

'use strict';

markerService.$inject = ['$http', '$q', '$rootScope'];
function markerService($http, $q, $rootScope) {

    var markers = $http.get('assets/data/markers.json').then(function(response) {
        return response.data.markers;
    });
    // var getMarkers = function() {
    //     return list.then(function(markers) {
    //         var _markers = angular.copy(markers);
    //         return _.map(_markers, function(marker) {
    //             if (marker.type === 'link') {
    //                 angular.extend(marker, {
    //                     draggable: true,
    //                     icon: {
    //                         limited_to_zoom: [4,5,6],
    //                         type: 'div',
    //                         html: '<div class="link"></div>',
    //                         // html: '<a href="'+marker.href+'" target="_blank"><div class="link"></div></a>',
    //                     }
    //                 });
    //             }
    //             return marker;
    //         });
    //     });
    // };
    return {
        // markers: getMarkers(),
        markers: markers,
        add: function (type, label) {
            if (type === 'link') {
                markers.then(function(markers) {
                    markers.push({
                        type: 'link',
                        lat: 49.83698245308484,
                        lng: -38.582421875
                    });
                    $rootScope.$broadcast('markersUpdated');
                });
            }
        },
        // getMarkers: getMarkers,
        remove: function (marker) {
            markers.then(function(markers) {
                var index = markers.indexOf(marker);
                if (index > -1) {
                    markers.splice(index, 1);
                    $rootScope.$broadcast('markersUpdated');
                }
            });
        }
    };
}

imageOverlayService.$inject = ['$http'];
function imageOverlayService($http) {

    var imageOverlays = $http.get('assets/data/imageOverlays.json').then(function(response) {
        return response.data.imageOverlays;
    });

    return {
        imageOverlays: imageOverlays
    }

}

angular.module('energy')
    .service('markerService', markerService)
    .service('imageOverlayService', imageOverlayService);
'use strict';

angular.module('energy')
    .directive('heightLikeWindow', ['$timeout', '$window', '$rootScope', '$state', function ($timeout, $window, $rootScope, $state) {
        var link = function (scope, el) {
            var offset = 0;
            if ($state.is("editor")) {
                offset = 200;
            }
            function setHeight() {
                el.css('height', $window.innerHeight - offset + 'px');
                $rootScope.$broadcast('resize');
            }
            $timeout(setHeight);
            angular.element($window).on('resize', setHeight);
            el.on('$destroy', function cleanup() {
                angular.element($window).off('resize', setHeight);
            });
        };
        return {
            restrict: 'A',
            priority: 50,
            link: link
        };
    }]);

'use strict';

angular.module('energy')
    .controller('MainCtrl', ["$scope", function ($scope) {

    }]);

angular.module("energy").run(["$templateCache", function($templateCache) {$templateCache.put("app/editor/editor.html","<div class=\"container-fluid editor-mode\"><div class=\"row\"><div class=\"col-md-3\"><div ng-include=\"\'components/editor/editor.html\'\"></div></div><div class=\"col-md-9\"><energy-map map=\"map\"></energy-map><energy-navigation map=\"map\"></energy-navigation><div class=\"row\"><div class=\"col-md-6\">Last click:<div ng-pluralize=\"\" count=\"map._selectedZone.length\" when=\"{0: \'southWest\', \'one\': \'northEast\', \'other\':\'\'}\"></div><pre ng-if=\"map._selectedZone.length == 2\">            \"bounds\": {\n                \"southWest\": {{ map._selectedZone[0] }},\n                \"northEast\": {{ map._selectedZone[1] }}\n            }</pre></div><div class=\"col-md-2\">Current zoom:<pre>{{ map.center.zoom }}</pre></div></div><div class=\"row\"><div class=\"col-md-6\"><pre style=\"max-height:100px; overflow:auto;\">{{ markers | json }}</pre><a href=\"data:application/x-json;base64,{{ markers | json | btoa }}\" download=\"markers.json\">markers.json</a></div><div class=\"col-md-6\"><pre style=\"max-height:100px; overflow:auto;\">{{ steps | json }}</pre><a href=\"data:application/x-json;base64,{{ steps | json | btoa }}\" download=\"steps.json\">steps.json</a></div></div></div></div></div>");
$templateCache.put("app/main/main.html","<div class=\"Main\"><energy-map map=\"map\"></energy-map><energy-navigation map=\"map\"></energy-navigation></div>");
$templateCache.put("components/editor/editor.html","<div ng-controller=\"EditorCtrl as editor\" class=\"Editor\" height-like-window=\"\"><a ng-click=\"editor.selectZone()\" class=\"btn btn-default\">Select a zone</a> <a ng-click=\"editor.addNewLink()\" class=\"btn btn-default\">Add a new link</a><div class=\"Editor__links\"><div ng-repeat=\"marker in editor.markers\" class=\"Editor__link\" ng-class=\"{\'active\': map.markerIndexSelected == $index}\"><form class=\"form\"><div><a class=\"btn btn-danger pull-right\" ng-click=\"editor.removeLink(marker)\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></a></div><div ng-bind=\"marker.$$hashKey\" ng-click=\"map.markerIndexSelected=$index\"></div><input type=\"text\" ng-model=\"marker.href\" placeholder=\"text\" class=\"form-control\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"input-group\"><span class=\"input-group-addon\" id=\"basic-addon1\">lat</span> <input type=\"number\" ng-model=\"marker.lat\" class=\"form-control\" aria-describedby=\"basic-addon1\" disabled=\"\"></div></div><div class=\"col-md-6\"><div class=\"input-group\"><input type=\"number\" ng-model=\"marker.lng\" class=\"form-control\" aria-describedby=\"basic-addon2\" disabled=\"\"> <span class=\"input-group-addon\" id=\"basic-addon2\">lng</span></div></div></div></form></div></div></div>");
$templateCache.put("components/map/map.html","<div class=\"Map\"><leaflet defaults=\"map.defaults\" center=\"map.center\" maxbounds=\"map.maxBounds\" markers=\"map.markers\" height-like-window=\"\"></leaflet></div>");
$templateCache.put("components/navigation/view.html","<div class=\"Navigation\"><div><ul><li><a ng-click=\"nav.previous()\">&lt;</a></li><li ng-repeat=\"step in nav.steps\" ng-click=\"nav.goTo($index)\" class=\"bullet\" ng-class=\"{\'active\': $index === nav.info.stepIndex}\">{{ $index }}</li><li><a ng-click=\"nav.next()\">&gt;</a></li></ul></div></div>");}]);