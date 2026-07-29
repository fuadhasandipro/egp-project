import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCalendar } from '../database/entities/academic-calendar.entity';
import { AttendanceLog } from '../database/entities/attendance-log.entity';
import { Institution } from '../database/entities/institution.entity';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { Notice } from '../database/entities/notice.entity';
import { User } from '../database/entities/user.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicCalendar,
      AttendanceLog,
      Institution,
      LeaveRequest,
      Notice,
      User,
    ]),
  ],
  controllers: [
    AttendanceController,
    LeaveRequestsController,
    NoticesController,
  ],
  providers: [AttendanceService, LeaveRequestsService, NoticesService],
  exports: [AttendanceService, LeaveRequestsService, NoticesService],
})
export class AttendanceModule {}
