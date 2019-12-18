import {IStorage} from './storage/IStorage';
import {
    INotificationData,
    IPlayerTask,
    IQuest,
    ITask, MissionTasks, NotificationType,
    Player,
    TaskCondition,
    TaskConditionOperator,
    TaskGroup,
    TaskStatus,
    Type
} from './types';
import {MongoClient} from 'mongodb';
import {DatabaseManager} from './database/DatabaseManager';
import {checkMissionCompleted} from './utils/checkMissionCompleted';
import {IMessengerProtocol} from './interfaces/IMessageProtocol';
import {validateQuestSystemConfig} from './utils/validateQuestSystemConfig';

export type StorageConfig = {
    class: Type<IStorage>
    config: any;
}
export type QuestSystemConfig = {
    mongoClient: MongoClient;
    messenger: IMessengerProtocol;
    //  storage: StorageConfig;

}
export class QuestSystem {
    private static instance?: QuestSystem;

    private messenger: IMessengerProtocol;


    private databaseManager: DatabaseManager;
    // private storage: IStorage;

    private constructor(config: QuestSystemConfig) {
        // this.storage = new config.storage.class(config.storage.config);

        validateQuestSystemConfig(config);

        this.messenger = config.messenger;
        this.databaseManager = DatabaseManager.getInstance(config.mongoClient);
        this.messenger.init(config);
    }
    /**
     * Implements the Singleton Pattern
     */
    private static getInstance(config: QuestSystemConfig): QuestSystem {
        if (!QuestSystem.instance) {
            QuestSystem.instance = new QuestSystem(config);
        }
        return QuestSystem.instance;
    }


    public static destroy() {
        QuestSystem.instance = undefined;
    }
    public static init(config: QuestSystemConfig) {
        const questSystem = QuestSystem.getInstance(config);
        return questSystem;
    }

    private async startQuestForPlayer(player: Player, quest: IQuest) {}


    /**
     *
     * @param data
     *
     * @returns Promise<Boolean> Whether the message has been consumed or not
     */
    public async onMessage(data: INotificationData): Promise<Boolean> {
        console.log(`[*] Just received a %s from player %s`, data.event, data.player.id);
        try {
            await this.handleMessage(data);
            return true;
        } catch (ex) {
            console.error('[!][QuestSystem::onMessage]: ' + ex.toString() );
            return false;
        }
    }


    private async handleMessage(data: INotificationData) {

        switch (data.type) {
            case NotificationType.EVENT:
                return this.handleTrigger(data);

            default:
                return ;

        }

    }


    private async handleTrigger(data: INotificationData) {
        const userTasks = await this.databaseManager.getPlayerActiveTasks(data.player.id);

        if (!userTasks) return true;

        // Get the user tasks triggered by the event
        const triggeredTask = userTasks.filter(t => t.trigger === data.event);

        const completedTask = triggeredTask.filter(task => QuestSystem.checkTaskCompleted(task, data));


        await this.databaseManager.completePlayerTasks(completedTask.map(t => t.id));

        for (const task of completedTask) {
            this.sendCompletedTaskMessage(task, data.event);
            if ((await this.checkMissionCompletedByTask(task))) {
                await this.completeMission(task, data.event);
                this.sendCompletedMissionMessage(task.playerId, task.missionId);
                if (await this.checkQuestCompleted(task.playerId, task.questId)) {
                    this.sendCompletedQuestMessage(task, data.event)
                }
            }
        }
    }

    async sendCompletedTaskMessage(task: IPlayerTask, trigger: string) {
        this.messenger.sendCompletedTask({
            playerId: task.playerId,
            questId: task.questId,
            missionId: task.missionId,
            taskId: task.taskId,
            completedAt: Date.now(),
            trigger
        });
    }

    async sendCompletedMissionMessage(task: IPlayerTask, trigger: string){
        this.messenger.sendCompletedMission({
            playerId: task.playerId,
            questId: task.questId,
            missionId: task.missionId,
            completedByTaskId: task.taskId,
            completedAt: Date.now(),
        })
    }

    async sendCompletedQuestMessage(task: IPlayerTask, trigger: string) {
        this.messenger.sendCompletedQuest({
            playerId: task.playerId,
            questId: task.questId,
            completedByTaskId: task.taskId,
            completedAt: Date.now(),
        })
    }
    /**
     * Checks if a player has completed a quest
     *
     * @param playerId
     * @param questId
     */
    public async checkQuestCompleted(playerId: any, questId: any ) {
        return await this.databaseManager.checkQuestCompleted(playerId, questId);
    }
    /**
     * Marks a user mission as completed.
     * @param playerId
     * @param missionId
     */
    private async completeMission(playerId: any, missionId: any) {
        return await this.databaseManager.completePlayerMission(playerId, missionId);
    }

    /**
     * Check if a completion of a task makes a mission completed.
     * @param playerTask
     */
    private async checkMissionCompletedByTask(playerTask: IPlayerTask): Promise<boolean> {
        const playerActiveMissionTasks = await this.databaseManager.getPlayerActiveMissionTasks(playerTask.playerId, playerTask.missionId);
        const mission = playerTask.quest.missions.find(m => m.id === playerTask.missionId);

        if (!mission) return false;

        return checkMissionCompleted(playerActiveMissionTasks.filter(task => task.status === TaskStatus.completed), mission);
    }


    /**
     * Checks if a task is complete by comparing its conditions
     * @param playerTask
     * @param data
     */
    private static checkTaskCompleted(playerTask: IPlayerTask, data: INotificationData): boolean {
        const quest = playerTask.quest;
        const mission = quest.missions.find(m => m.id === playerTask.missionId);
        const currentTask = QuestSystem.findMissionTask(mission!.tasks, playerTask.taskId);

        if (!currentTask) {
            throw new Error('Cannot find a task in this quest');
        }
        if (!currentTask.conditions) {
            return true;
        }

        const conditionsMet = [];
        for (const condition of currentTask.conditions) {
            if (QuestSystem.checkConditionMet(condition, data)) {
                conditionsMet.push(condition);
            }
        }

        return conditionsMet.length === currentTask.conditions.length;

    };

    /**
     * Checks is a condition is met with the event data
     * @param condition
     * @param data
     */
    private static checkConditionMet(condition: TaskCondition, data: INotificationData): boolean {
        if (!data[condition.parameterName]) throw new Error('Event data does not have parameter ' + condition.parameterName);
        switch (condition.operator) {
            case TaskConditionOperator.EQUAL:
                return data[condition.parameterName] === condition.value;
            case TaskConditionOperator.IN:
                return (condition.value as Array<number|string>).includes(data[condition.parameterName]);
            case TaskConditionOperator.NOT_IN:
                return !(condition.value as Array<number|string>).includes(data[condition.parameterName]);
            case TaskConditionOperator.GREATER_THAN:
                return data[condition.parameterName] > condition.value;
            case TaskConditionOperator.LESS_THAN:
                return data[condition.parameterName] < condition.value;
            case TaskConditionOperator.RANGE: {
                const range = condition.value as Array<number>;
                return data[condition.parameterName] > range[0] && data[condition.parameterName] < range[0];
            }
            default:
                return false;
        }
    }

    /**
     * Find a mission task by id
     *
     * Mission tasks have this structure
     * Es. 1) Task1 OR Task2 -> tasks = [ [Task1], [Task2] ]
     * Es. 2) (Task 1 AND Task 2) OR Task3 -> tasks = [[Task1,Task2], [Task3]]
     * O can have event sub groups
     * Es 3) ((Task1 AND Task2) OR Task3) OR Task4 -> tasks = [ [ [ Task1, Task2 ], [ Task3 ] ], [ Task4 ] ]
     * @param tasks
     * @param taskId
     * @private
     */
    private static findMissionTask(tasks: MissionTasks, taskId: string): ITask | undefined {

        if ('id' in tasks) {
            // it's a single task
            return (tasks as ITask).id === taskId ? tasks : undefined;
        }

        for (const taskGroup of tasks.elements) {
            const task = this.findMissionTask(taskGroup, taskId);
            if (task) return task;
        }
    }


}
