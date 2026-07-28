import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Roles('admin')
  @Post('admin/officers')
  createOfficer(@Body() dto: CreateOfficerDto) {
    return this.usersService.createOfficer(dto);
  }

  @Roles('admin')
  @Get('admin/users')
  findAllUsers(@Query() query: PaginationQueryDto & { role?: string; status?: string }) {
    return this.usersService.findAllUsers(query);
  }

}
