import {IMission, IPlayerTask, ITask, MissionTasks, TaskGroup, TaskStatus} from '../types';

/*
  Mission tasks have this structure
  Es. 1) Task1 AND Task2 -> tasks =  { relation: ‘AND’, elements: [Task1, Task2] }
  Es. 2) Task1 OR Task2 -> tasks = { relation: 'OR', elements. [Task1, Task2 ]}
  Es. 3) (Task 1 AND Task 2) OR Task3 -> tasks = { relation: ‘OR’, elements: [ { relation: ‘AND’, elements: [Task1,Task2] } , Task3 ] }
  O can have event sub groups
  Es 4) ((Task1 AND Task2) OR Task3) OR Task4 -> tasks = {	relation: ‘OR’,
    elements: [
 		{
			relation: ‘OR’
			elements: {
				relation: ‘AND’,
				elements: [Task1, Task2]
			}C
		 },
		Task4
	]
   }
  Es 5) (Task1 OR Task 2) AND Task3 -> tasks = {
    relation: 'AND',
    elements: [ {
      relation: 'OR',
      elements: [Task1, Task2],
   }, Task3]
  }

 */


/**
 * Check if a mission is completed by user tasks.
 *
 * @param playerMissionTasks all user completed tasks of the mission
 * @param mission the mission object
 */
export const checkMissionCompleted = (playerMissionTasks: IPlayerTask[], mission: IMission): boolean => {
  return checkTaskGroupCompleted(mission.tasks, playerMissionTasks);
};


/**
 *
 * @param group
 * @param playerMissionTasks
 */
export const checkTaskGroupCompleted = (group: MissionTasks, playerMissionTasks: IPlayerTask[]): boolean => {

  if ('id' in group) {
    // it's a single task. We are in the inner level
    return !!playerMissionTasks.find(pTask => pTask.taskId === group.id)
  }

  if (group.relation === 'AND') {
    // Group is completed only if EVERY element is completed
    for (const element of group.elements) {
      if (!checkTaskGroupCompleted(element, playerMissionTasks)) {
        return false;
      }
    }
    return true;
  } else {
    // Group is completed if JUST ONE element is completed
    for (const element of group.elements) {
      if (checkTaskGroupCompleted(element, playerMissionTasks)) {
        return true;
      }
    }
    return false;
  }

};

