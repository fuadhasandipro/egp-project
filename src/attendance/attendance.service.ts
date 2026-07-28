import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginate } from '../common/helpers/paginate.helper';
import { AttendanceLog } from '../database/entities/attendance-log.entity';
import { User } from '../database/entities/user.entity';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CheckInDto } from './dto/check-in.dto';

const DEFAULT_RADIUS_METERS = 200;
const DEFAULT_START_TIME = '09:00';
const DEFAULT_TIMEZONE = 'Asia/Dhaka';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private attendanceRepo: Repository<AttendanceLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { institution: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.institution) {
      throw new ForbiddenException(
        'You must be assigned to an institution before checking in',
      );
    }

    const schoolLat = Number(user.institution.latitude);
    const schoolLng = Number(user.institution.longitude);

    if (!Number.isFinite(schoolLat) || !Number.isFinite(schoolLng)) {
      throw new InternalServerErrorException(
        'Institution coordinates are not configured correctly',
      );
    }

    const now = this.getCurrentSchoolTime();
    const existingLog = await this.attendanceRepo.findOne({
      where: { userId, date: now.date },
    });

    if (existingLog) {
      throw new ConflictException('Attendance has already been recorded today');
    }

    const distanceMeters = this.calculateDistanceMeters(
      dto.lat,
      dto.lng,
      schoolLat,
      schoolLng,
    );
    const status = this.resolveStatus(distanceMeters, now.minutes);
    const attendance = this.attendanceRepo.create({
      userId,
      date: now.date,
      status,
      lat: dto.lat,
      lng: dto.lng,
    });
    const savedAttendance = await this.attendanceRepo.save(attendance);

    return {
      ...savedAttendance,
      distanceMeters: Math.round(distanceMeters),
      recordedAt: now.iso,
    };
  }

  async findAll(requesterId: string, query: AttendanceQueryDto) {
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: { institution: true, role: true },
    });

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    const roleName = requester.role?.name as string;
    const qb = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('user.institution', 'institution')
      .select([
        'attendance.id',
        'attendance.userId',
        'attendance.date',
        'attendance.status',
        'attendance.lat',
        'attendance.lng',
        'user.id',
        'user.email',
        'user.status',
        'user.institutionId',
        'institution.id',
        'institution.name',
        'institution.eiin',
        'institution.type',
        'institution.latitude',
        'institution.longitude',
      ]);

    if (roleName === 'head_teacher') {
      if (!requester.institutionId) {
        throw new ForbiddenException(
          'No institution is assigned to your account',
        );
      }

      qb.andWhere('user.institutionId = :institutionId', {
        institutionId: requester.institutionId,
      });
    } else if (['officer', 'to', 'ato'].includes(roleName)) {
      // The shared schema has no region field yet. If an officer is assigned
      // to an institution, that assignment is used as the available scope.
      if (requester.institutionId) {
        qb.andWhere('user.institutionId = :institutionId', {
          institutionId: requester.institutionId,
        });
      }
    } else if (roleName !== 'admin') {
      throw new ForbiddenException('You cannot view attendance logs');
    }

    if (query.date) {
      qb.andWhere('attendance.date = :date', { date: query.date });
    }

    if (query.status) {
      qb.andWhere('attendance.status = :status', { status: query.status });
    }

    if (query.userId) {
      qb.andWhere('attendance.userId = :userId', { userId: query.userId });
    }

    if (query.institutionId) {
      if (
        roleName === 'head_teacher' &&
        query.institutionId !== requester.institutionId
      ) {
        throw new ForbiddenException(
          'You can only view attendance for your own school',
        );
      }

      qb.andWhere('user.institutionId = :filterInstitutionId', {
        filterInstitutionId: query.institutionId,
      });
    }

    if (query.search) {
      qb.andWhere('user.email ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    const allowedSortFields = ['id', 'date', 'status'];
    const sortBy = allowedSortFields.includes(query.sortBy || '')
      ? query.sortBy
      : 'date';

    return paginate(qb, { ...query, sortBy }, 'attendance');
  }

  private resolveStatus(
    distanceMeters: number,
    currentMinutes: number,
  ): 'Present' | 'Late' | 'Absent' {
    const radiusMeters = this.getPositiveNumber(
      process.env.ATTENDANCE_RADIUS_METERS,
      DEFAULT_RADIUS_METERS,
    );

    if (distanceMeters > radiusMeters) {
      return 'Absent';
    }

    return currentMinutes > this.getStartTimeMinutes() ? 'Late' : 'Present';
  }

  private getStartTimeMinutes() {
    const startTime = process.env.ATTENDANCE_START_TIME || DEFAULT_START_TIME;
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(startTime);

    if (!match) {
      return 9 * 60;
    }

    return Number(match[1]) * 60 + Number(match[2]);
  }

  private getPositiveNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private getCurrentSchoolTime() {
    const timezone = process.env.ATTENDANCE_TIMEZONE || DEFAULT_TIMEZONE;
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    const date = `${values.year}-${values.month}-${values.day}`;
    const minutes = Number(values.hour) * 60 + Number(values.minute);

    return { date, minutes, iso: now.toISOString() };
  }

  private calculateDistanceMeters(
    sourceLat: number,
    sourceLng: number,
    destinationLat: number,
    destinationLng: number,
  ) {
    const earthRadiusMeters = 6371000;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const latDelta = toRadians(destinationLat - sourceLat);
    const lngDelta = toRadians(destinationLng - sourceLng);
    const sourceLatRadians = toRadians(sourceLat);
    const destinationLatRadians = toRadians(destinationLat);
    const rawA =
      Math.sin(latDelta / 2) ** 2 +
      Math.cos(sourceLatRadians) *
        Math.cos(destinationLatRadians) *
        Math.sin(lngDelta / 2) ** 2;
    const a = Math.min(1, Math.max(0, rawA));

    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
