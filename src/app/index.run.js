export function runBlock ($log) {
  'ngInject';
  $log.debug('runBlock end');
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyDRnmFvi11EA8XHLEufa5Dy2BfjOj3US2I",
    authDomain: "micromanager-181912.firebaseapp.com",
    databaseURL: "https://micromanager-181912.firebaseio.com",
    projectId: "micromanager-181912",
    storageBucket: "micromanager-181912.appspot.com",
    messagingSenderId: "614168858624"
  };
  firebase.initializeApp(config);
}
