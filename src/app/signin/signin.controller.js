export class SigninController {
  constructor($scope, $rootScope, $log, $resource, $state, $firebaseAuth, $cookies) {
    'ngInject';

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$resource = $resource;
    this.$state = $state;
    this.$cookies = $cookies;
    this.user = null;
    this.email = null;
    this.password = null;
    this.errorMessage = null;
    this.staySignedIn = true;
    this.auth = $firebaseAuth();
    this.user = this.$cookies.getObject('user');
    if(this.user){
      this.$state.go('home');
    }
  }

  onSigninClicked() {
    this.auth.$signInWithEmailAndPassword(this.email, this.password).then(user => {
      this.user = user;
      this.today = new Date();
      this.expiresValue = new Date(this.today);
      this.expiresValue.setSeconds(this.today.getSeconds() + 3600);
      if (this.staySignedIn){
        this.$cookies.putObject('user', this.user, { 'expires': this.expiresValue });
      }
      this.$state.go('home');
    }, (error) => {
      this.errorMessage = "Authentication failed: " + error;
    });
  }
}
