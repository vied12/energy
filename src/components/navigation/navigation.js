function energyNavigation($http, navService) {
    function navigationController() {
        var vm = this;
        vm.previous = navService.previous;
        vm.next = navService.next;
        vm.info = navService.info;
        vm.goTo = navService.goTo;
        vm.openImprint = navService.toggleImprint.bind(null, true);
        navService.steps.then(function(steps) {
            vm.steps = steps;
        });
        vm.setMarkerStyle = function(index) {
            var offset = (index / (vm.steps.length-1)) * 100;
            return {left: offset + '%'};
        };
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

navService.$inject = ['$http', '$rootScope', '$stateParams', '$state'];
function navService($http, $rootScope, $stateParams, $state) {
    var info = {
        stepIndex: parseInt($stateParams.step || 1),
        imprint: false
    };
    var steps = $http.get('assets/data/steps.json').then(function(response){return response.data.steps});
    var currentBounds;

    function goTo(i) {
        // update the url
        $state.go('.', {step: i}, {notify: false});
        // send an event to asking to update the area
        return steps.then(function(steps) {
            info.stepIndex = i;
            currentBounds = steps[i].bounds;
            $rootScope.$broadcast('boundsSelected', currentBounds);
        });
    }

    function next() {
        return steps.then(function(steps) {
            var next_step = (info.stepIndex < steps.length - 1) ? info.stepIndex + 1 : 0;
            goTo(next_step);
        });
    }

    function previous() {
        return steps.then(function(steps) {
            var next_step = (info.stepIndex > 0) ? info.stepIndex - 1 : steps.length - 1;
            goTo(next_step);

        });
    }

    function getCurrentBounds() {
        return steps.then(function(steps) {
            return steps[info.stepIndex].bounds;
        });
    }

    function updateNavigationFromCoord(coord) {
        var bounds;
        return steps.then(function(steps) {
            _.forEach(steps, function(step, i) {
                if (step.shortName !== 'Overview') {
                    bounds = L.latLngBounds(step.bounds.southWest, step.bounds.northEast);
                    if (bounds.contains(L.latLng(coord.lat, coord.lng))) {
                        // update the navigation
                        info.stepIndex = i;
                        return false;
                    }
                }
            })
        });
    }

    function toggleImprint(open) {
        if (angular.isDefined(open)) {
            info.imprint = open;
        } else {
            info.imprint = !info.imprint;
        }
    }

    goTo(info.stepIndex);

    return {
        next: next,
        previous: previous,
        getCurrentBounds: getCurrentBounds,
        goTo: goTo,
        info: info,
        toggleImprint: toggleImprint,
        steps: steps,
        updateNavigationFromCoord: _.debounce(updateNavigationFromCoord, 500)
    }
}

angular.module('energy')
    .directive('energyNavigation', ['$http', 'navService', energyNavigation])
    .service('navService', navService);

// EOF
