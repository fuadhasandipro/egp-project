import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeaveRequest } from '../database/entities/leave-request.entity';
import { User } from '../database/entities/user.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async create(userId: string, dto: CreateLeaveRequestDto) {
    if (dto.startDate > dto.endDate) {
      throw new BadRequestException(
        'The leave end date cannot be before the start date',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { institution: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.institutionId) {
      throw new ForbiddenException(
        'You must be assigned to an institution to request leave',
      );
    }

    const leaveRequest = this.leaveRequestRepo.create({
      userId,
      reason: dto.reason,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'Pending',
    });

    return this.leaveRequestRepo.save(leaveRequest);
  }

  async updateStatus(
    approverId: string,
    leaveRequestId: string,
    dto: UpdateLeaveStatusDto,
  ) {
    const approver = await this.userRepo.findOne({
      where: { id: approverId },
      relations: { institution: true, role: true },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    if (!approver.institutionId) {
      throw new ForbiddenException(
        'You must be assigned to an institution to review leave requests',
      );
    }

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId },
      relations: { user: true },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.user.institutionId !== approver.institutionId) {
      throw new ForbiddenException(
        'You can only review leave requests from your own school',
      );
    }

    if (leaveRequest.status !== 'Pending') {
      throw new BadRequestException(
        'Only pending leave requests can be approved or rejected',
      );
    }

    leaveRequest.status = dto.status;
    const savedRequest = await this.leaveRequestRepo.save(leaveRequest);

    void this.mailerService
      .sendMail({
        to: leaveRequest.user.email,
        subject: `Leave Request ${dto.status}`,
        text:
          `Your leave request from ${leaveRequest.startDate} to ` +
          `${leaveRequest.endDate} has been ${dto.status.toLowerCase()}.`,
      })
      .catch((error: unknown) => {
        console.error('Failed to send leave status email', error);
      });

    return {
      id: savedRequest.id,
      userId: savedRequest.userId,
      reason: savedRequest.reason,
      startDate: savedRequest.startDate,
      endDate: savedRequest.endDate,
      status: savedRequest.status,
    };
  }
}
