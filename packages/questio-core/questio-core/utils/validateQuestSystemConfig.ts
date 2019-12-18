import {QuestSystemConfig} from '../QuestSystem';

export function validateQuestSystemConfig(config: QuestSystemConfig) {
  if (!config.messenger) {
    throw new Error('Invalid configuration: `messenger` option must be set')
  }
  if (!config.mongoClient) {
    throw new Error('Invalid configuration: `mongoClient` must be set');
  }

  if (
    !('sendCompletedTask' in config.messenger) ||
    !('sendCompletedMission' in config.messenger) ||
    !('sendCompletedQuest' in config.messenger))
  {
    throw new Error('Invalid messenger implementation. You must implement all IMessengerProtocol methods');
  }
}
