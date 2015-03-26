function SplashscreenDirective($window) {
    function SplashscreenCtrl() {
        var vm = this;
        function close() {
            vm.isClose = true;
        }
        angular.extend(vm, {
            isClose: false,
            close: _.debounce(close),
        });
    }
    return {
        restrict: 'E',
        templateUrl: 'components/splashscreen/view.html',
        scope: true,
        controller: SplashscreenCtrl,
        controllerAs: 'splash'
    }
}

angular.module('energy')
    .directive('energySplash', ['$window', SplashscreenDirective]);

// EOF
