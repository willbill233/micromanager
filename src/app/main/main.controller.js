export class MainController {
  constructor ($uibModal, $scope, $rootScope, $log, $resource) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/tasks');
    this.modalInstance = null;
    this.tasks = null;

    this.response = this.tasksService.query();
    this.response.$promise.then(data => {
      this.tasks = data;
      console.log(this.tasks);
    });

  }

  createTaskClicked() {
    this.modalInstance = this.$uibModal.open({
      templateUrl: 'app/task/createtaskmodal.html',
      controller: 'CreateTaskController',
      controllerAs: '$ctrl'
    });
    this.modalInstance.result.then(() => {
      //OK PRESSED
    }, () => {
      this.$log.info('modal-component dismissed at: ' + new Date());
    });

  }
}
