export class SigninController {
  constructor($scope, $rootScope, $log, $resource, $state) {
    'ngInject';

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$resource = $resource;
    this.$state = $state;
    this.authService = $resource('/rest/auth');
    this.user = null;
    this.email = null;
    this.password = null;
    this.errorMessage = null;
  }

  onSigninClicked() {
    this.user = {
      email: this.email,
      password: this.password
    };
    this.response = this.authService.save(this.user);
    this.isLoading = true;
    this.response.$promise.then(data => {
      this.user = null;
      this.email = null;
      this.password = null;
      this.isLoading = false;
      if(!data.failed){
        this.$state.go('home', { user: data });
      } else {
        this.errorMessage = data.message;
      }
    }, (reason) => {
      this.isLoading = false;
      this.$log.log(reason);
      this.errorMessage = reason;
    });
  }
}
