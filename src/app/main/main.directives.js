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
            setHeight();
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
