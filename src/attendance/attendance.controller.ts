import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CheckInDto } from './dto/check-in.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Roles('teacher', 'head_teacher')
  @Post('check-in')
  checkIn(@Request() req: AuthenticatedRequest, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher')
  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.findAll(req.user.id, query);
  }
}
