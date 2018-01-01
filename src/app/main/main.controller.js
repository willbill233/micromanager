import _ from 'lodash'

export class MainController {
  constructor($uibModal, $scope, $rootScope, $log, $resource, $stateParams, $sce, $state, $window, $firebaseAuth, $cookies) {
    'ngInject';

    this.$ctrl = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.$sce = $sce;
    this.$state = $state;
    this.$window = $window;
    this.auth = $firebaseAuth();
    this.$cookies = $cookies;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/tasks');
    this.boardsService = $resource('/rest/boards');
    this.taskUpdateService = $resource('/rest/task/update');
    this.authService = $resource('/rest/auth');
    this.modalInstance = null;
    this.tasks = null;
    this.boards = null;
    this.isLoading = true;
    this.getAuthenticatedUserProperties();
  }

  getAuthenticatedUserProperties(){
    this.fireBaseUser = this.auth.$getAuth();
    this.userSession = this.$cookies.getObject('user');
    if (!this.fireBaseUser) {
      if (!this.userSession){
        this.$state.go('unauthorised');
      } else {
        this.fireBaseUser = this.userSession;
      }
    }
    this.response = this.authService.get({ email: this.fireBaseUser.email });
    this.response.$promise.then(data => {
      this.user = data;
      this.getBoards();
      if (data.failed) {
        this.$state.go('unauthorised');
      }
    }, () => {
      this.$state.go('unauthorised');
    });
  }

  getBoards() {
    this.queryBoards = this.user.visibleBoards.secondary.slice(0);
    this.queryBoards.push(this.user.visibleBoards.main);
    this.currentBoard = null;
    this.response = this.boardsService.query({'board_ids': this.queryBoards});
    this.response.$promise.then(data => {
      this.boards = data;
      this.onBoardClicked(_.find(this.boards, {'idShort': this.user.visibleBoards.main}));
    }, (reason) => {
      this.$log.log(reason);
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
        },
        user: () => {
          return this.user;
        }
      }
    });
    this.modalInstance.result.then(() => {
      this.getTasksForBoard(this.currentBoard.idShort);
    }, () => {
      this.$log.info('modal-component dismissed at: ' + new Date());
    })
  }

  editTaskClicked(task) {
    this.modalInstance = this.$uibModal.open({
      templateUrl: 'app/task/updatetaskmodal.html',
      controller: 'UpdateTaskController',
      controllerAs: '$ctrl',
      resolve: {
        boards: () => {
          return this.boards;
        },
        currentBoard: () => {
          return this.currentBoard;
        },
        task: () => {
          return task;
        }
      }
    });
    this.modalInstance.result.then(() => {
      this.getTasksForBoard(this.currentBoard.idShort);
    }, () => {
      this.$log.info('modal-component dismissed at: ' + new Date());
    })
  }

  deleteTaskClicked(task) {
    this.modalInstance = this.$uibModal.open({
      templateUrl: 'app/task/deletetaskmodal.html',
      controller: 'DeleteTaskController',
      controllerAs: '$ctrl',
      resolve: {
        task: () => {
          return task;
        }
      }
    });
    this.modalInstance.result.then(() => {
      this.getTasksForBoard(this.currentBoard.idShort);
    }, () => {
      this.$log.info('modal-component dismissed at: ' + new Date());
    })
  }

  onBoardClicked(board) {
    this.currentBoard = board;
    this.models = {
      selected: null,
      lists: {}
    };
    this.currentBoard.lists.forEach(list => {
      this.models.lists[list.name] = [];
    });
    this.lists = Object.keys(this.models.lists);
    this.getTasksForBoard(board.idShort);
  }

  onLogOutClicked() {
    this.user = null;
    this.fireBaseUser = null;
    this.$cookies.remove('user');
    this.auth.$signOut().then(() => {
      this.$state.go('signin');
    });
  }

  getTasksForBoard(id) {
    this.isLoading = true;
    this.response = this.tasksService.query({'board_id': id});
    this.response.$promise.then(data => {
      this.tasks = data;
      this.lists.forEach(list => {
        this.models.lists[list] = [];
      });
      this.tasks.forEach(task => {
          const boardType = this.currentBoard.isParentBoard ? 'projectManager' : 'team';
          this.models.lists[task.phase[boardType].phase].push(_.cloneDeep(task));
        }
      );
      this.isLoading = false;
    }, (reason) => {
      this.$log.log(reason);
      this.isLoading = false;
    });
  }

  onDrop(srcList, srcIndex, targetList, targetIndex, item) {
    if (this.currentBoard.isParentBoard) {
      if(!item.phase.team.phase){
        this.errorMessage = 'Changing phases must be carried out by editing the task, as a team needs to be assigned.';
        return false;
      }
      if(item.phase.team.phase !== 'Ready for UAT' && !['Requested', 'Assigned to team'].includes(targetList)){
        this.errorMessage = item.team.name + ' have not finished development of this task. Please ensure task is marked as \'Ready for UAT\' before changing project overview phase.';
        return false;
      }
      if(targetList === 'Requested'){
        item.phase.team = { phase: null, listId: null };
        item.team = { name: 'Unassigned', status: 'Unassigned'};
      }
      this.changeListPosition(srcList, srcIndex, targetList, targetIndex);
      const phase = targetList;
      const listId = _.find(this.currentBoard.lists, {'name': phase}).id;
      item.phase.projectManager = {phase, listId};
      return this.updateTaskPhase(item);
    } else {
      //List changing logic
      this.changeListPosition(srcList, srcIndex, targetList, targetIndex);
      this.assignPhases(item, targetList);
      return this.updateTaskPhase(item);
    }
  };

  updateTaskPhase(item){
    this.response = this.taskUpdateService.save(item);
    this.isLoading = true;
    this.response.$promise.then(() => {
      this.getTasksForBoard(this.currentBoard.idShort);
      this.isLoading = false;
      return true;
    }, () => {
      this.isLoading = false;
      return false;
    });
  }

  changeListPosition(srcList, srcIndex, targetList, targetIndex){
    this.models.lists[targetList].splice(targetIndex, 0, srcList[srcIndex]);
    if (_.isEqual(srcList, this.models.lists[targetList]) && targetIndex <= srcIndex) srcIndex++;
    srcList.splice(srcIndex, 1);
  }

  assignPhases(item, targetList){
    const teamPhase = targetList;
    const listId = _.find(this.currentBoard.lists, {'name': teamPhase}).id;
    const parentBoard = _.find(this.boards, { 'idShort': this.currentBoard.parentBoard});
    let pmListId = null;
    let phase = null;
    if(teamPhase === 'Ready for UAT'){
      pmListId = _.find(parentBoard.lists, { 'name': 'Development complete' }).id;
      phase = 'Development complete';
    } else {
      pmListId = _.find(parentBoard.lists, { 'name': 'Assigned to team' }).id;
      phase = 'Assigned to team';
    }
    item.phase.team = {phase: teamPhase, listId: listId};
    item.phase.projectManager = {phase: phase, listId: pmListId};
  }

  getActiveBoard(board) {
    if (_.isEqual(this.currentBoard, board)) {
      return "list-group-item active";
    }
    return "list-group-item"
  }

  trelloButtonClicked() {
    this.$window.open('https://trello.com/b/' + this.currentBoard.idShort, '_blank')
  }
}
