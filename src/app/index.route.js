export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    })
    .state('signin', {
      url: '/',
      templateUrl: 'app/signin/signin.html',
      controller: 'SigninController',
      controllerAs: 'signin'
    })
    .state('unauthorised', {
      url: '/unauthorised',
      templateUrl: 'app/signin/unauthorised.html',
      controller: 'UnauthorisedController',
      controllerAs: 'unauth'
    });

  $urlRouterProvider.otherwise('/');
}
