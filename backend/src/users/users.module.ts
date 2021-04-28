import { Module } from '@nestjs/common';
import {connectionFactory} from "../connectionFactory";
import {UsersDal} from "./users.dal";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersDal, connectionFactory],
})
export class UsersModule {}
