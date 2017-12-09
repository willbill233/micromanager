import _ from 'lodash'
export class CreateTask {
  constructor ($uibModalInstance, $scope, $resource) {
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

    this.teams = [
      { id: 0, label: 'Unassigned' },
      { id: 1, label: 'Web Team' },
      { id: 2, label: 'Core Platforms' }
      ];
    this.TEAMS_CONST = {
      UNASSIGNED: 0,
      WEB_TEAM: 1,
      CORE_PLATFORMS: 2
    };this.statuses = [
      { id: 0, label: 'Open' },
      { id: 1, label: 'Closed' }
      ];
    this.STATUSES_CONST = {
      OPEN: 0,
      CLOSED: 1
    };
    this.phases = [
      { id: 0, label: 'Requested' },
      { id: 1, label: 'Assigned To Team' },
      { id: 2, label: 'In Development' },
      { id: 3, label: 'UAT Testing' },
      { id: 4, label: 'Awaiting Client Sign-off' }
      ];
    this.PHASES_CONST = {
      REQUESTED: 0,
      ASSIGNED_TO_TEAM: 1,
      IN_DEV: 2,
      IN_UAT: 3,
      AWAIT_CLIENT: 4
    };

  }

  ok(){
    const task = {
      name: this.name,
      desc: this.desc,
      team: this.team,
      phase: this.phase,
      status: this.status
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
    this.message = null;
    if(team.id !== this.TEAMS_CONST.UNASSIGNED && this.phase.id === this.PHASES_CONST.REQUESTED){
      this.phase = _.find(this.phases, { id: this.PHASES_CONST.ASSIGNED_TO_TEAM })
    }
    if(team.id === this.TEAMS_CONST.UNASSIGNED){
      this.phase = _.find(this.phases, { id: this.PHASES_CONST.REQUESTED })
    }
  }

  validatePhase(phase){
    this.message = null;
    if(phase.id !== this.PHASES_CONST.REQUESTED && this.team.id === this.TEAMS_CONST.UNASSIGNED){
      this.message = 'Please ensure you choose a team when the phase is not set as \'Requested\'.'
    }
    if(phase.id === this.PHASES_CONST.REQUESTED){
      this.team = _.find(this.teams, { id: this.TEAMS_CONST.UNASSIGNED });
    }
  }

}
