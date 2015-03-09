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
        // controllerAs: 'nav',

        // link: function(scope) {
        //     scope.$watch('data', function() {
        //         if (angular.isDefined(scope.data)) {
        //             scope.goTo(scope.data.steps[scope.index].bounds);
        //         }
        //     });
        // }
    }
}

navService.$inject = ['$http', '$rootScope'];
function navService($http, $rootScope) {
    var index = 0;
    var data = $http.get('data/data.json');
    var currentBounds;

    function goTo(bounds) {
        // $scope.map.goTo(bounds);
        currentBounds = bounds;
        $rootScope.$broadcast('boundsSelected', bounds);
    }

    function next() {
        data.then(function(data) {
            if (index < data.data.steps.length - 1) {
                index++;
                goTo(data.data.steps[index].bounds);
            }
        });
    }

    function previous() {
        data.then(function(data) {
            if (index > 0) {
                index--;
                goTo(data.data.steps[index].bounds);
            }
        });
    }

    function getCurrentBounds() {
        return data.then(function(data) {
            return data.data.steps[index].bounds;
        });
    }

    return {
        next: next,
        previous: previous,
        goTo: goTo,
        getCurrentBounds: getCurrentBounds,
        index: index,
        data: data
    }
}

angular.module('energy')
    .directive('energyNavigation', ['$http', 'navService', energyNavigation])
    .service('navService', navService);

// EOF
