export class CreateTask {
  constructor ($uibModalInstance, $scope) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance

  }

  ok(){
    this.$uibModalInstance.close();
  }

  cancel(){
    this.$uibModalInstance.dismiss('cancel');
  }

}
