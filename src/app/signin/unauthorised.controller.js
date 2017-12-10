export class UnauthorisedController {
  constructor($scope, $rootScope, $state) {
    'ngInject';

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$state = $state;
  }

  onSignInClicked(){
    this.$state.go('signin');
  }
}
