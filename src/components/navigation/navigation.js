function energyNavigation($http) {
    function navigationController($scope) {

        $scope.index = 0;
        $http.get('data.json').success(function(data) {

            $scope.data = data;

            $scope.goTo = function(bounds) {
                $scope.map.goTo(bounds);
            };

            $scope.next = function() {
                if ($scope.index < $scope.data.steps.length - 1) {
                    $scope.index++;
                    $scope.goTo(data.steps[$scope.index].bounds);
                }
            };

            $scope.previous = function() {
                if ($scope.index > 0) {
                    $scope.index--;
                    $scope.goTo(data.steps[$scope.index].bounds);
                }
            };

        });
    }
    return {
        restrict: 'E',
        scope: {
            map: '='
        },
        templateUrl: 'components/navigation/view.html',
        replace: true,
        controller: navigationController,
        controllerAs: 'nav',
        link: function(scope) {
            scope.$watch('data', function() {
                if (angular.isDefined(scope.data)) {

                    scope.goTo(scope.data.steps[0].bounds);
                }
            });
        }
    }
}

angular.module('energy')
    .directive('energyNavigation', ['$http', energyNavigation]);

// EOF
