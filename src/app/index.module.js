import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { SigninController } from './signin/signin.controller';
import { UnauthorisedController } from './signin/unauthorised.controller';
import { CreateTask } from './task/createTask.controller';
import { UpdateTask } from './task/updateTask.controller';
import { DeleteTask } from './task/deleteTask.controller';
import { ViewTask } from './task/viewTask.controller';

angular.module('umanager', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ui.router', 'ui.bootstrap', 'toastr', 'dndLists', 'firebase'])
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .controller('MainController', MainController)
  .controller('SigninController', SigninController)
  .controller('UnauthorisedController', UnauthorisedController)
  .controller('CreateTaskController', CreateTask)
  .controller('UpdateTaskController', UpdateTask)
  .controller('DeleteTaskController', DeleteTask)
  .controller('ViewTaskController', ViewTask);
