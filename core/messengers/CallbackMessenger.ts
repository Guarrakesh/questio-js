import {
  CompletedMissionPayload,
  CompletedQuestPayload,
  CompletedTaskPayload,
} from '../interfaces/IMessageProtocol';
import {QuestSystemConfig} from '../QuestSystem';


export type callbackMessengerOptions = {
  init?: (config: QuestSystemConfig) => void,
  sendCompletedMission: (payload: CompletedMissionPayload) => void,
  sendCompletedTask: (payload: CompletedTaskPayload) => void,
  sendCompletedQuest: (payload: CompletedQuestPayload) => void,

}
export function callbackMessenger(options: callbackMessengerOptions) {
  return options;
}
