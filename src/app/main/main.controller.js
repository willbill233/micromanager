import _ from 'lodash'

export class MainController {
  constructor ($uibModal, $scope, $rootScope, $log, $resource, $stateParams, $sce) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.$sce = $sce;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/tasks');
    this.boardsService = $resource('/rest/boards');
    this.modalInstance = null;
    this.tasks = null;
    this.boards = null;
    this.user = this.$stateParams.user;
    this.user.visibleBoards.secondary.push(this.user.visibleBoards.main);
    this.currentBoard = null;

    this.response = this.boardsService.query({ 'board_ids': this.user.visibleBoards.secondary });
    this.isLoading = true;
    this.response.$promise.then(data => {
      this.boards = data;
      this.onBoardClicked(_.find(this.boards, { 'idShort': this.user.visibleBoards.main }));
      this.isLoading = false;
    }, (reason) => {
      $log.log(reason);
      this.isLoading = false;
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
    })
  }

  onBoardClicked(board){
    this.currentBoard = board;
    this.setBoardUrl(board.idShort);
    this.getTasksForBoard(board.idShort)
  }

  getTasksForBoard(id){
    this.response = this.tasksService.query({ 'board_id': id });
    this.isLoading = true;
    this.response.$promise.then(data => {
      this.tasks = data;
      this.isLoading = false;
    }, (reason) => {
      this.$log.log(reason);
      this.isLoading = false;
    });
  }

  getActiveBoard(board){
    if(_.isEqual(this.currentBoard, board)){
      return "list-group-item active";
    }
    return "list-group-item"
  }

  setBoardUrl(id){
    console.log(id);
    this.boardUrl = this.$sce.trustAsResourceUrl('https://trello.com/b/'+id+'.html');
  }
}
