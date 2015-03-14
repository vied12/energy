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