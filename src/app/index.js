'use strict';

angular.module('energy', ['ngCookies', 'ngTouch', 'ui.router', 'ui.bootstrap', 'leaflet-directive'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('editor', {
                url: '/editor',
                templateUrl: 'app/editor/editor.html'
            })
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            });
        $urlRouterProvider.otherwise('/');
    });
