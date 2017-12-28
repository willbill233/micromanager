export class DeleteTask {
  constructor ($uibModalInstance, $scope, $resource, task) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/task/delete');
    this.task = task;
  }

  ok(){
    const payload = {
      projectManagementTrelloId: this.task.projectManagementTrelloId,
      teamTrelloId: this.task.teamTrelloId,
      _id: this.task._id
    };

    this.response = this.tasksService.save(payload);
    this.isLoading = true;
    this.response.$promise.then(() => {
      this.isLoading = false;
      this.$uibModalInstance.close();
    }, () => {
      this.isLoading = false;
      this.$uibModalInstance.close();
    });

  }

  cancel(){
    this.$uibModalInstance.dismiss('cancel');
  }

}
