export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main',
      params: {
        user: null
      }
    })
    .state('signin', {
      url: '/',
      templateUrl: 'app/signin/signin.html',
      controller: 'SigninController',
      controllerAs: 'signin'
    });

  $urlRouterProvider.otherwise('/');
}
