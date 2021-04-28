import { Injectable } from '@nestjs/common';
import {Task} from "../interfaces/task.interface";
import {User} from "../interfaces/user.interface";
import {UsersDal} from "./users.dal";

@Injectable()
export class UsersService {
  constructor(private readonly usersDal: UsersDal) {}
  

  async getUser(): Promise<User> {
    return this.usersDal.getUser();
  }

  async postUser(user: User): Promise<string> {
    return this.usersDal.postUser(user);
  }

  async deleteUser(id: string): Promise<string> {
    console.log('user id in services users.service for deletion: ', id);

    return this.usersDal.deleteUser(id);
  }

}