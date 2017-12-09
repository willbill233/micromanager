export class SigninController {
  constructor($scope, $rootScope, $log, $resource, $state) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$resource = $resource;
    this.$state = $state;
    this.authService = $resource('/rest/auth');
    this.user = null;
    this.email = null;
    this.password = null;

  }

  onSigninClicked() {
    this.user = {
      email: this.email,
      password: this.password
    };
    this.response = this.authService.save(this.user);
    this.isLoading = true;
    this.response.$promise.then(data => {
      if(data.visibleBoards){
        this.$state.go('home', { user: data });
      }
      this.isLoading = false;
    }, (reason) => {
      this.$log.log(reason);
      this.isLoading = false;
    });
  }
}
