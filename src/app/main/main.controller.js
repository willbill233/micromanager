export class MainController {
  constructor ($uibModal, $scope, $rootScope, $log) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.modalInstance = null;

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
