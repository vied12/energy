'use strict';

angular
    .module('energy', ['ngCookies', 'ngTouch', 'ui.router', 'ui.bootstrap', 'leaflet-directive', 'ngAnimate'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/?step',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            })
            .state('editor', {
                controller: ['$scope', 'navService', 'markerService', function($scope, navService, markerService) {
                    navService.steps.then(function(steps) {
                        $scope.steps = steps;
                    });
                    markerService.markers.then(function(markers) {
                        $scope.markers = markers;
                    });
                    $scope.getMarker = function() {
                        var new_markers = angular.copy($scope.markers);
                        return {
                            markers: _.map(new_markers, function(m) {
                                delete m.icon;
                                delete m.draggable;
                                return m;
                            })
                        }
                    };
                }],
                url: '/editor?step',
                templateUrl: 'app/editor/editor.html'
            });
        $urlRouterProvider.otherwise('/');
    })
    .filter('btoa', function() {
        return function(input) {
            return btoa(input);
        };
    })
    .filter('digit', function() {
        return function(input) {
            if (input !== null && input !== undefined) {
              var str = "" + input;
              while (str.length < 2) str = "0" + str;
              return str;
            }
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
