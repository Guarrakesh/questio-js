import {ITask, TaskConditionOperator} from '../../types';

export const singleTask: ITask =
  {
    id: "ososos",
    lead: "Raccoglia l'ascia",
    trigger: 'item_collected',
    conditions: [
      {
        parameterName: 'id',
        value: 'axe',
        operator: TaskConditionOperator.EQUAL
      },
    ]


  };


