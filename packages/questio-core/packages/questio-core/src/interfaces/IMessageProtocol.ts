import {INotificationData} from '../types';

export interface IMessageProtocol {
  onMessage(data: INotificationData): any;

}
