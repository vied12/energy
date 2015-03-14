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
