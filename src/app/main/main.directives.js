'use strict';

angular.module('energy')
    .directive('heightLikeWindow', ['$timeout', '$window', function ($timeout, $window) {
        var offset = 0;
        var link = function (scope, el) {
            function setHeight() {
                el.css('height', $window.innerHeight - offset + 'px');
                scope.$emit('resize');
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
