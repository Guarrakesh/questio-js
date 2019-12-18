import {QuestSystem} from '../QuestSystem';
import {EventEmitter} from 'events';
import {MongoClient} from 'mongodb';
import * as sinon from 'sinon';
import {IQuest, TaskConditionOperator} from '../types';
import {DatabaseManager} from '../database/DatabaseManager';


const mockQuests: Array<IQuest> = [{
  id: 'quest',
  deployed: true,
  name: "La cerca della gemma",
  description: "Riuscirai a conquistare l'archengemma?",
  missions: [
    {
      id: 123,
      name: "Un'ascia ci salverà tutti",
      description:"Prima di iniziare, ci serve un'ascia",
      cancelable: false,
      tasks: {
        id: 'singletask',
        lead: "Raccoglia l'ascia",
        trigger: 'item_collected',
        conditions: [{parameterName: 'slug', operator: TaskConditionOperator.EQUAL, value: 'axe'}]

      }
    },
    {
      id: 122,
      name: 'Su le armature!',
      description: 'Adesso ci manca uno scudo e un\'armatura',
      cancelable: false,
      tasks: {
        relation: 'AND',
        elements: [
          { id: 'task1', lead: 'Raccogli due scudi ', quantity: 2, trigger: 'item_collected', conditions: [ { operator: TaskConditionOperator.EQUAL, value: 'shield', parameterName: 'slug' } ]},
          { id: 'task2', lead: 'Raccogli un\'armatura', quantity: 1, trigger: 'item_collected', conditions: [{ operator: TaskConditionOperator.EQUAL, value: 'armor', parameterName: 'slug'}] }
        ]
      }
    },
    {
      id: 133,
      name: 'Quest or quello',
      description: 'Raccogli un ascia e uno scudo o parla con il mozzo',
      cancelable: false,
      tasks: {
        relation: 'OR',
        elements: [
          {
            relation: 'OR',
            elements: [
              { id: 'task1', lead: 'Raccogli uno scudo ', quantity: 2, trigger: 'item_collected', conditions: [ { operator: TaskConditionOperator.EQUAL, value: 'shield', parameterName: 'slug' } ]},
              { id: 'task2', lead: 'Raccogli un\'ascia' , quantity: 1, trigger: 'item_collected', conditions: [{ operator: TaskConditionOperator.EQUAL, value: 'armor', parameterName: 'slug'}] }
            ]
          },
          { id: 'task1', lead: 'Raccogli due scudi ', quantity: 2, trigger: 'item_collected', conditions: [ { operator: TaskConditionOperator.EQUAL, value: 'shield', parameterName: 'slug' } ]},
        ]


      }
    }
  ]
}];

let mongoClient: MongoClient, eventEmitter: EventEmitter;
beforeAll(async () => {
  mongoClient = await MongoClient.connect("mongodb://localhost:27017/questio_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await  mongoClient.db().collection('qs_quests').insertMany(mockQuests)
});
afterAll(async () => {
  await mongoClient.db().collection('qs_quests').deleteMany({});

});

beforeEach(() => {
  eventEmitter = new EventEmitter();

});
afterEach(() => {
  QuestSystem.destroy();
});
describe('QuestSystem', () => {
  test('QuestSystem init', () => {
    const questSystem = QuestSystem.init({
      mongoClient,
    });
    expect(questSystem).toBeDefined();

  });
  test('QuestSystem reacts onMessage and calls database instance', async() => {
    // await mongoClient.db().collection('qs_quests').findOneAndUpdate({ name: 'La cerca della gemma'}, {
    //   $set: { 'missions.0.tasks.0.0.className': 'NewCollectAxe'}
    // });

    const questSystem = QuestSystem.init({ mongoClient });

    const spy = sinon.spy();
    DatabaseManager.getInstance().getPlayerActiveTasks = spy;
    questSystem.onMessage({ player: { id: 123 }, event: 'item_collected' });
    sinon.assert.calledWith(spy, 123)
  });

  describe('QuestSystem::checkTaskCompleted', function () {

  });

})

