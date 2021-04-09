import {Inject, Injectable} from '@nestjs/common';

import knex, {Knex} from "knex";
import {OUR_DB} from "../constants";
import {User} from "../interfaces/user.interface";

const TASK_TABLE = 'tasks_table';
@Injectable()
export class UsersDal {

  constructor(@Inject(OUR_DB) private db:Knex) {
  }

  async getUser(): Promise<User> {
    return { username: 'Amitush', id: 123 };
  }

  async postUser(user: User): Promise<string> {
    //console.log(user);
    return "post user";
  }

  async deleteUser(id: string): Promise<string> {
    console.log('user id in services users.dal for deletion: ', id);

    return `This action removes a #${id} user`;
  }
}
