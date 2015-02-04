'use strict';

angular.module('energy')
    .directive('heightLikeWindow', ['$timeout', '$window', function ($timeout, $window) {
        var link = function (scope, el) {
            function setHeight() {
                el.css('height', $window.innerHeight - 100 + 'px');
                scope.$emit('resize');
            }
            function cleanup() {
                angular.element($window).off('resize', setHeight);
            }
            $timeout(setHeight);
            angular.element($window).on('resize', setHeight);
            el.on('$destroy', cleanup);
        };
        return {
            restrict: 'A',
            link: link
        };
    }]);
