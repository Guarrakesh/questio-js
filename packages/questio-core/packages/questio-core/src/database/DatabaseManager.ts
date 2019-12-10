import {Db, FilterQuery, MongoClient, UpdateQuery} from 'mongodb';
import {IPlayerMission, IPlayerTask, IQuest, MissionStatus, TaskStatus} from '../types';


const QS_DBNAME = 'questio_db';
const QS_PLAYER_MISSION_COLLECTION = 'qs_player_missions';


export class DatabaseManager {
    private static instance: DatabaseManager;

    private mongoClient: MongoClient;

    private db: Db;

    private constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
        this.db = this.mongoClient.db(QS_DBNAME);

    }

    public static getInstance(mongoClient?: MongoClient): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager(mongoClient!);
        }

        return DatabaseManager.instance;
    }

    async  getActiveQuests(filter: FilterQuery<any>): Promise<Array<IQuest>> {
        return this.mongoClient.db(QS_DBNAME).collection('qs_quests')
          .find<IQuest>(
            { deployed: true, ...filter },
            { projection: { id: { '$toString': '$_id' } } } )
          .toArray();
    }

    async updatePlayerMission(filter: FilterQuery<IPlayerTask>, updateQuery: UpdateQuery<IPlayerTask>) {
        return this.mongoClient.db(QS_DBNAME).collection(QS_PLAYER_MISSION_COLLECTION)
          .updateOne(filter, updateQuery);
    }


    async getPlayerMissions(playerId: any, filter: FilterQuery<IPlayerMission>): Promise<Array<IPlayerMission>> {
        return await this.mongoClient.db(QS_PLAYER_MISSION_COLLECTION)
          .collection(QS_PLAYER_MISSION_COLLECTION)
          .find({ playerId, ...filter }).toArray();
    }
    async getPlayerActiveTasks(playerId: any, filter: FilterQuery<any> = {}): Promise<IPlayerTask[]>
    {
        const collection = this.db.collection(QS_PLAYER_MISSION_COLLECTION);
        const playerActiveMissions = await collection
          .find<IPlayerMission>({
              playerId,
              status: MissionStatus.IN_PROGRESS,
              ...filter
          }, {
              projection: { id: { '$toString': '$_id' }, tasks: 1  }
          })

          .toArray();
        if (playerActiveMissions) {
            // Get the quests ids
            const questIds =  playerActiveMissions.map(t => t.questId);
            // Get the quests by ids and place it in an object
            const result = await this.getActiveQuests({ _id: { $in: questIds } });

            const quests: { [key: string]: any } = result.reduce((acc, rec) => ({ [rec.id]: rec }), {});

            let tasks: Array<IPlayerTask> = [];
            for (const mission of playerActiveMissions) {
                tasks = [...tasks, ...mission.tasks.map<IPlayerTask>(t => ({ ...t, quest: quests[t.questId ] } ) )]
            }

            return tasks;
        }

        return [];

    }



    async completePlayerMission(playerId: any, missionId: any) {
        const collection = this.db.collection(QS_PLAYER_MISSION_COLLECTION);
        return collection.updateOne({ playerId, missionId }, { $set: { status: MissionStatus.COMPLETED }});
    }
    async getPlayerActiveMissionTasks(playerId: any, missionId: any): Promise<IPlayerTask[]> {
        const collection = this.db.collection(QS_PLAYER_MISSION_COLLECTION);
        return await this.getPlayerActiveTasks(playerId, { missionId });

    }

    async completePlayerTask(id: any) {
        await this.updatePlayerMission({ 'tasks._id': id }, {
            $set: { '$tasks.$.completedAt': (new Date()), '$tasks.$.status': TaskStatus.completed  }
        })
    }

    async checkQuestCompleted(playerId: any, questId: any) {
        const collection = this.db.collection(QS_PLAYER_MISSION_COLLECTION);

        const result = await collection.find({ playerId, questId, status: { $not: MissionStatus.DONE } }).count();
        return result === 0;
    }

    async completePlayerTasks(ids: any[]) {
        const res = await this.mongoClient.db(QS_DBNAME).collection(QS_PLAYER_MISSION_COLLECTION)
          .updateMany({ 'tasks._id' : { $in: ids }}, { $set: { '$tasks.$.completedAt': (new Date()), '$tasks.$.status': TaskStatus.completed  }});

    }



    async getPlayerActiveQuests(playerId: any): Promise<IQuest[]>
    {
        const collection = this.mongoClient.db(QS_DBNAME).collection('qs_quests');

        const playerMissions = await this.getPlayerMissions(playerId, { status: MissionStatus.IN_PROGRESS});
        const ids = playerMissions.map(task => task.questId);
        return await collection.find({ _id: { $in: ids }}).toArray();

    }





}
