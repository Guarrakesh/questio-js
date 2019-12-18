import {
  CompletedMissionPayload,
  CompletedQuestPayload,
  CompletedTaskPayload,
} from '../interfaces/IMessageProtocol';


export type callbackMessengerOptions = {
  sendCompletedMission: (payload: CompletedMissionPayload) => void,
  sendCompletedTask: (payload: CompletedTaskPayload) => void,
  sendCompletedQuest: (payload: CompletedQuestPayload) => void,

}
export function callbackMessenger(options: callbackMessengerOptions) {
  return options;
}
