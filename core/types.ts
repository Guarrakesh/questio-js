export interface DeepArray<T> extends Array<T | DeepArray<T>> {}

export interface Player {
    id: any;
}

export type NotificationId = string;

export enum NotificationType {
    EVENT = 'QS_EVENT',
    START_NEXT_MISSION = 'QS_START_NEXT_MISSION',
    START_QUEST = 'QS_START_QUEST',
    FORCE_TASK_COMPLETE = 'QS_FORCE_TASK_COMPLETE',
}


export interface INotificationData {
    type: NotificationType;
    player: Player;
    event: string;
    [x: string]: any;
}
export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export enum TaskStatus {
    pending = 'PENDING',
    completed = 'COMPLETED',
    canceled = 'CANCELED',
}
export interface IPlayerTask {
    id: any;
    playerId: any
    taskId: any
    missionId: any;
    questId: any;

    trigger: string;
    quest: IQuest;
    progress?: number;
    status: TaskStatus;

    completedAt?: Date;
    canceledAt?: Date;
    assignedAt: Date;
}


export enum MissionStatus {
    PENDING = 'PENDING', // Not unlocked yet
    UNLOCKED = 'UNLOCKED', //the mission is visible to user, but its tasks has not been started yet
    IN_PROGRESS = 'IN_PROGRESS', //  One of the task has been started
    COMPLETED = 'COMPLETED', // all tasks have been completed
    DONE = 'DONE', // Mission completed and player collected the reward
    CANCELED = 'CANCELED', // player canceled the mission (if possible)
}
export interface IPlayerMission {
    status: MissionStatus;
    missionId: any;
    questId: any;
    playerId: any;
    tasks: IPlayerTask[]; // playerTask ids of completed tasks
}
export enum TaskConditionOperator {
    'EQUAL', 'IN', 'NOT_IN', 'GREATER_THAN', 'LESS_THAN', 'RANGE'
}

export interface TaskCondition {
    parameterName: string;
    operator: TaskConditionOperator;
    value: string | boolean | number | Array<string|number>;
}

export type TaskGroup = {
    relation: 'OR' | 'AND';
    elements: MissionTasks[],
}

export interface ITask {
    id: any
    lead: string;
    quantity?: number;
    deadline?: Date;
    trigger: string;
    conditions?: TaskCondition[];

}

export type MissionTasks = TaskGroup | ITask;
export interface IMission {
    id: any
    name: string;
    description: string;
    tasks: MissionTasks;
    cancelable?: boolean;
}
export interface MissionConnection {

}
export interface IQuest {
    id: any
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    missions: IMission[]
    deployed?: boolean;
}
