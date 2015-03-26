function SplashscreenDirective($http, navService) {
    function SplashscreenCtrl() {
        var vm = this;
        angular.extend(vm, {
            isClose: false,
            close: function() {
                vm.isClose = true;
            }
        });
    }
    return {
        restrict: 'E',
        templateUrl: 'components/splashscreen/view.html',
        scope: true,
        controller: SplashscreenCtrl,
        controllerAs: 'splash',
        link: function(scope, element, attr, ctrl) {
            function CloseSplashScreen() {
                scope.splash.close();
                scope.$apply();
            }
            element.get(0).addEventListener("mousewheel", CloseSplashScreen, false);
            element.get(0).addEventListener("DOMMouseScroll", CloseSplashScreen, false);
        }
    }
}

angular.module('energy')
    .directive('energySplash', ['$http', 'navService', SplashscreenDirective]);

// EOF
