import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {User} from "../interfaces/user.interface";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('GetUser')
  async getUser(): Promise<User> {
    return this.usersService.getUser();
  }

  @Post('PostUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.postUser(createUserDto);
  }

  @Delete('DeleteUser')
  async remove(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
