import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get logged-in user profile' })
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Create a new officer (Admin only)' })
  @Roles('admin')
  @Post('admin/officers')
  createOfficer(@Body() dto: CreateOfficerDto) {
    return this.usersService.createOfficer(dto);
  }

  @ApiOperation({ summary: 'Get all users with pagination and filtering (Admin only)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @Roles('admin')
  @Get('admin/users')
  findAllUsers(@Query() query: PaginationQueryDto & { role?: string; status?: string }) {
    return this.usersService.findAllUsers(query);
  }

}
