import {checkMissionCompleted} from './checkMissionCompleted';
import {mockQuests} from '../tests/mocks/quests';
import {IPlayerTask, ITask, TaskStatus} from '../types';

describe('checkMissionCompleted', () => {

  test('should return true with a simple task and matching player task completed', () => {

    const mission = mockQuests[0].missions[0];
    // @ts-ignore
    const playerTask: IPlayerTask = {
      taskId: 'singletask',
      status: TaskStatus.completed,
    };
    const result = checkMissionCompleted([playerTask], mission);
    expect(result).toBeTruthy();
  })

  test('should return false with simple task and no matching player task completed', () => {

    const mission = mockQuests[0].missions[0];
    // @ts-ignore
    const playerTask: IPlayerTask = {
      taskId: 'someothertask',
      status: TaskStatus.completed,
    };
    const result = checkMissionCompleted([playerTask], mission);
    expect(result).toBeFalsy();
  })


  test('should return true with a simple AND mission tasks and matching player tasks completed', () => {

    const mission = mockQuests[0].missions[1];

    const playerTasks: IPlayerTask[]= [
      // @ts-ignore
      {
        taskId: 'task1',
        status: TaskStatus.completed,
      },
      // @ts-ignore
      {
        taskId: 'task2',
        status: TaskStatus.completed,
      }
    ];
    const result = checkMissionCompleted(playerTasks, mission);
    expect(result).toBeTruthy();
  })


  test('should return false with a simple AND mission tasks and JUST ONE matching player task completed', () => {

    const mission = mockQuests[0].missions[1];

    const playerTasks: IPlayerTask[]= [
      // @ts-ignore
      {
        taskId: 'task1',
        status: TaskStatus.completed,
      },
      // @ts-ignore
      {
        taskId: 'task22222',
        status: TaskStatus.completed,
      }
    ];
    const result = checkMissionCompleted(playerTasks, mission);
    expect(result).toBeFalsy();
  })


  test('should return true with a simple OR mission tasks and JUST ONE matching player task completed', () => {

    const mission = mockQuests[0].missions[2];

    const playerTasks: IPlayerTask[]= [
      // @ts-ignore
      {
        taskId: 'task1',
        status: TaskStatus.completed,
      },
      // @ts-ignore
      {
        taskId: 'task22222',
        status: TaskStatus.completed,
      }
    ];
    const result = checkMissionCompleted(playerTasks, mission);
    expect(result).toBeTruthy();
  })

  test('should return true with a OR of a OR mission tasks and JUST ONE of the first element matches the player task completed', () => {

    const mission = mockQuests[0].missions[3];

    const playerTasks: IPlayerTask[]= [
      // @ts-ignore
      {
        taskId: 'task1',
        status: TaskStatus.completed,
      },
      // @ts-ignore
      {
        taskId: 'task22222',
        status: TaskStatus.completed,
      }
    ];
    const result = checkMissionCompleted(playerTasks, mission);
    expect(result).toBeTruthy();
  })
  test('should return true with a OR of a OR mission tasks and JUST ONE of the inner element matches the player task completed', () => {

    const mission = mockQuests[0].missions[3];

    const playerTasks: IPlayerTask[]= [
      // @ts-ignore
      {
        taskId: 'task11',
        status: TaskStatus.completed,
      },
      // @ts-ignore
      {
        taskId: 'task22222',
        status: TaskStatus.completed,
      }
    ];
    const result = checkMissionCompleted(playerTasks, mission);
    expect(result).toBeTruthy();
  })
});
