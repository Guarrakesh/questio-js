import {INotificationData} from '../types';


export type CompletedTaskPayload<IDType = any> = {
  taskId: IDType,
  missionId: IDType;
  questId: IDType;
  playerId: IDType,
  trigger: string;
  completedAt: number;
}

export type CompletedMissionPayload<IDType = any> = {
  playerId: IDType;
  missionId: IDType;
  completedByTaskId: IDType;
  completedAt: number;
  questId: IDType;
}

export type CompletedQuestPayload<IDType = any> = {
  playerId: IDType;
  questId: IDType;
  completedByTaskId: IDType;
  completedAt: number;
}
export interface IMessengerProtocol {

  sendCompletedTask(payload: CompletedTaskPayload): void;
  sendCompletedMission(payload: CompletedMissionPayload): void;
  sendCompletedQuest(payload: CompletedQuestPayload): void;


}
