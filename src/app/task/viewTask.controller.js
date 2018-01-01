export class ViewTask {
  constructor ($uibModalInstance, $scope, task, currentBoard) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.task = task;
    this.currentBoard = currentBoard;
  }

  ok(){
    this.$uibModalInstance.dismiss('cancel');
  }
}
