import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { LeaveRequestsService } from './leave-requests.service';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller('api/leave-requests')
export class LeaveRequestsController {
  constructor(private leaveRequestsService: LeaveRequestsService) {}

  @Roles('teacher')
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveRequestsService.create(req.user.id, dto);
  }

  @Roles('head_teacher')
  @Patch(':id/status')
  updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leaveRequestsService.updateStatus(req.user.id, id, dto);
  }
}
