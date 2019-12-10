import {Mission} from '../Mission';

export interface IStorage {

    getAllMissions(): Promise<Mission[]>;


}
