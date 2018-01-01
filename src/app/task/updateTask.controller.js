import _ from 'lodash'
export class UpdateTask {
  constructor ($uibModalInstance, $scope, $resource, boards, currentBoard, task, user) {
    'ngInject';
    this.$scope = $scope;
    this.$uibModalInstance = $uibModalInstance;
    this.$resource = $resource;
    this.tasksService = $resource('/rest/task/update');
    this.boards = boards;
    this.task = task;
    this.user = user;
    this.phaseDisabled = false;
    this.currentBoard = currentBoard;

    this.teams = [
      { status: 'Unassigned', name: 'Unassigned' }
    ];
    if(this.currentBoard.isParentBoard){
      this.boards.forEach((board)=> {
        if(!board.isParentBoard){
          this.teams.push({ status: 'Assigned', name: board.name });
        }
      });
    } else {
      this.teams.push({ status: 'Assigned', name: this.currentBoard.name });
    }

    this.phases = [];
    this.currentBoard.lists.forEach((list) => {
      this.phases.push({ phase: list.name, listId: list.id })
    });
    this.statuses = [
      { id: 0, status: 'Open' },
      { id: 1, status: 'Closed' }
    ];

    this.name = this.task.name;
    this.desc = this.task.desc;
    this.team = _.find(this.teams, { 'name': this.task.team.name });
    let phase = this.task.phase.projectManager.phase;
    if(!this.currentBoard.isParentBoard){
      phase = this.task.phase.team.phase;
    }
    this.phase = _.find(this.phases, { 'phase': phase });
    this.status = _.find(this.statuses, { 'status': this.task.status });
    this.setClientDefaults();
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
      boards,
      projectManagementTrelloId: this.task.projectManagementTrelloId,
      teamTrelloId: this.task.teamTrelloId,
      _id: this.task._id
    };

    if (this.currentBoard.isParentBoard) {
      if(task.phase.team.phase !== 'Ready for UAT' && !['Requested', 'Assigned to team'].includes(task.phase.projectManager.phase)){
        this.message = task.team.name + ' have not finished development of this task. Please ensure task is marked as \'Ready for UAT\' before changing project overview phase.';
        return false;
      }
      if(task.phase.projectManager.phase === 'Requested'){
        task.phase.team = { phase: null, listId: null };
        task.team = { name: 'Unassigned', status: 'Unassigned'};
      }
      const phase = task.phase.projectManager.phase;
      const listId = _.find(this.currentBoard.lists, {'name': phase}).id;
      task.phase.projectManager = {phase, listId};
      this.updateTask(task);
    } else {
      this.assignPhases(task);
      this.updateTask(task);
    }
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

  assignPhases(task){
    const teamPhase = task.phase.team.phase;
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
    task.phase.team = {phase: teamPhase, listId: listId};
    task.phase.projectManager = {phase: phase, listId: pmListId};
  }

  updateTask(task){
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

  setClientDefaults(){
    if(this.user.type === 'CLIENT'){
      this.phases = [{ phase: 'Requested', listId: this.currentBoard.lists[0].id }];
      this.teams = [{ name: 'Unassigned', status: 'Unassigned' }];
      this.phase = this.phases[0];
      this.team = this.teams[0];
    }
  }
}
