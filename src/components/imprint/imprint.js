function ImprintDirective($http, navService) {
    function ImprintController() {
        var vm = this;
        vm.navInfo = navService.info;
        vm.closeImprint = navService.toggleImprint.bind(null, false);
    }
    return {
        restrict: 'E',
        templateUrl: 'components/imprint/view.html',
        scope: true,
        controller: ImprintController,
        controllerAs: 'imprint',
    }
}

angular.module('energy')
    .directive('energyImprint', ['$http', 'navService', ImprintDirective]);
    // .service('navService', navService);

// EOF
