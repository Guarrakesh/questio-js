import {IQuest, TaskConditionOperator} from '../../types';

export const mockQuests: Array<IQuest> = [{
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
      description: 'Adesso ci manca uno scudo E un\'armatura',
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
      id: 122,
      name: 'Su le armature (o gli scudi)!',
      description: 'Adesso ci manca uno scudo O un\'armatura',
      cancelable: false,
      tasks: {
        relation: 'OR',
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
              { id: 'task11', lead: 'Raccogli uno scudo ', quantity: 2, trigger: 'item_collected', conditions: [ { operator: TaskConditionOperator.EQUAL, value: 'shield', parameterName: 'slug' } ]},
              { id: 'task22', lead: 'Raccogli un\'ascia' , quantity: 1, trigger: 'item_collected', conditions: [{ operator: TaskConditionOperator.EQUAL, value: 'armor', parameterName: 'slug'}] }
            ]
          },
          { id: 'task1', lead: 'Raccogli due scudi ', quantity: 2, trigger: 'item_collected', conditions: [ { operator: TaskConditionOperator.EQUAL, value: 'shield', parameterName: 'slug' } ]},
        ]


      }
    }
  ]
}];
