function energyNavigation($http, navService) {
    function navigationController($scope) {
        $scope.previous = navService.previous;
        $scope.next = navService.next;
    }
    return {
        restrict: 'E',
        templateUrl: 'components/navigation/view.html',
        replace: true,
        controller: navigationController
    }
}

navService.$inject = ['$http', '$rootScope'];
function navService($http, $rootScope) {
    var index = 0;
    var steps = $http.get('assets/data/steps.json').then(function(response){return response.data.steps});
    var currentBounds;

    function goTo(bounds) {
        currentBounds = bounds;
        $rootScope.$broadcast('boundsSelected', bounds);
    }

    function next() {
        steps.then(function(steps) {
            if (index < steps.length - 1) {
                index++;
                goTo(steps[index].bounds);
            }
        });
    }

    function previous() {
        steps.then(function(steps) {
            if (index > 0) {
                index--;
                goTo(steps[index].bounds);
            }
        });
    }

    function getCurrentBounds() {
        return steps.then(function(steps) {
            return steps[index].bounds;
        });
    }

    return {
        next: next,
        previous: previous,
        getCurrentBounds: getCurrentBounds,
        // goTo: goTo,
        // index: index,
        steps: steps
    }
}

angular.module('energy')
    .directive('energyNavigation', ['$http', 'navService', energyNavigation])
    .service('navService', navService);

// EOF
