import {Mission, MissionAttributes} from '../Mission';

export function createMission<M extends Mission>(m: { new(config: MissionAttributes): M}, config: MissionAttributes) {
    const mission = new m(config);
}
