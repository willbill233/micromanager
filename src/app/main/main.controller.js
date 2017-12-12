import _ from 'lodash'

export class MainController {
  constructor ($uibModal, $scope, $rootScope, $log, $resource, $stateParams, $sce, $state) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.$sce = $sce;
    this.$state = $state;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/tasks');
    this.boardsService = $resource('/rest/boards');
    this.modalInstance = null;
    this.tasks = null;
    this.boards = null;
    this.user = this.getAuthenticatedUser();
    this.queryBoards = this.user.visibleBoards.secondary.slice(0);
    this.queryBoards.push(this.user.visibleBoards.main);
    this.currentBoard = null;

    this.response = this.boardsService.query({ 'board_ids': this.queryBoards });
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
      controllerAs: '$ctrl',
      resolve: {
        boards: () => {
          return this.boards;
        },
        currentBoard: () => {
          return this.currentBoard;
        }
      }
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

  onLogOutClicked(){
    this.user = null;
    this.$state.go('signin');
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
    this.boardUrl = this.$sce.trustAsResourceUrl('https://trello.com/b/'+id+'.html');
  }

  getAuthenticatedUser(){
    if(this.$stateParams.user){
      return this.$stateParams.user;
    }
    this.$state.go('unauthorised');
  }
}
