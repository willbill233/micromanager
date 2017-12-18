import _ from 'lodash'
export class CreateTask {
  constructor ($uibModalInstance, $scope, $resource, boards, currentBoard) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/task');
    this.name = null;
    this.desc = null;
    this.team = null;
    this.phase = null;
    this.status = null;
    this.boards = boards;
    this.teamDisabled = false;
    this.phaseDisabled = false;
    this.currentBoard = currentBoard;

    this.teams = [
      { status: 'Unassigned', name: 'Unassigned' }
      ];
    this.boards.forEach((board)=> {
      if(!board.isParentBoard){
        this.teams.push({ status: 'Assigned', name: board.name });
      }
    });

    this.phases = [];
    this.currentBoard.lists.forEach((list, i) => {
      if(this.currentBoard.isParentBoard){
        if(i <= 1){
          this.phases.push({ phase: list.name, listId: list.id })
        }
      } else {
        this.phases.push({ phase: list.name, listId: list.id })
      }
    });
    this.statuses = [
      { id: 0, status: 'Open' },
      { id: 1, status: 'Closed' }
      ];
  }

  ok(){
    const boards = [this.currentBoard.idShort];
    const phase = this.phase;
    const teamBoard = _.find(this.boards, { 'name': this.team.name });
    phase.teamListId = teamBoard ? teamBoard.lists[0].id : null;
    if (teamBoard){
      boards.push(teamBoard.idShort)
    }
    const task = {
      name: this.name,
      desc: this.desc,
      team: this.team,
      phase,
      status: this.status.status,
      boards
    };

    this.response = this.tasksService.save(task);
    this.isLoading = true;
    this.response.$promise.then(() => {
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
    this.$uibModalInstance.close();
  }

  cancel(){
    this.$uibModalInstance.dismiss('cancel');
  }

  validateTeam(team){
    this.phaseDisabled = false;
    this.message = null;
    if(team.status !== "Unassigned"){
      this.phase = _.find(this.phases, {'phase': 'Assigned to team' });
      this.phaseDisabled = true;
    }
    this.validatePhase(this.phase);
  }

  validatePhase(phase){
    this.message = null;
    if(this.team.status === "Unassigned" && phase.phase !== "Requested"){
      this.message = "Please ensure you select a team if you wish to set the phase as 'Assigned to team'"
    }
  }

}
