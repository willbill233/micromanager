import _ from 'lodash'
export class CreateTask {
  constructor ($uibModalInstance, $scope, $resource, boards, currentBoard, user) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/task/create');
    this.name = null;
    this.desc = null;
    this.team = null;
    this.phase = null;
    this.status = null;
    this.boards = boards;
    this.user = user;
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

    if(!this.currentBoard.isParentBoard){
      this.teams = [ { status: 'Assigned', name: this.currentBoard.name } ]
    }

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

    if(this.user.type === 'CLIENT'){
      this.teams = [
        { status: 'Unassigned', name: 'Unassigned' }
      ];
      this.phases = [{ phase: 'Requested', listId: this.currentBoard.lists[0].id }]
    }
  }

  ok(){
    let boards = [this.currentBoard.idShort];
    const teamBoard = _.find(this.boards, { 'name': this.team.name });
    const teamId = teamBoard ? teamBoard.lists[0].id : null;
    let teamPhase = teamId ? { phase: 'Awaiting Development', listId: teamId } : { phase: null, listId: null };
    let phase = this.phase;
    if (teamBoard){
      boards.push(teamBoard.idShort)
    }
    if (!this.currentBoard.isParentBoard){
      const parentBoard = _.find(this.boards, { 'idShort': this.currentBoard.parentBoard });
      const listName = this.phase.phase === 'Ready for UAT' ? 'Development complete' : 'Assigned to team';
      const list = _.find(parentBoard.lists, { 'name': listName });
      boards = [this.currentBoard.idShort, parentBoard.idShort];
      phase = { phase: 'Assigned to team', listId: list.id};
      teamPhase = this.phase;
    }
    const task = {
      name: this.name,
      desc: this.desc,
      team: this.team,
      phase: { projectManager: phase, team: teamPhase },
      status: this.status.status,
      boards
    };

    this.response = this.tasksService.save(task);
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
