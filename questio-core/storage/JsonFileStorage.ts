import {IStorage} from './IStorage';
import fs from 'fs';
import path from 'path';
import util from 'util';

import {createMission} from '../factory/MissionFactory';
import {IMission} from '../types';


const readFileAsync = util.promisify(fs.readFile);

type JsonFileStorageConfig = {
    filePath: string;
}
