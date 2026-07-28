import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginate } from '../common/helpers/paginate.helper';
import { Institution } from '../database/entities/institution.entity';
import { Notice } from '../database/entities/notice.entity';
import { User } from '../database/entities/user.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticeQueryDto } from './dto/notice-query.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepo: Repository<Notice>,
    @InjectRepository(Institution)
    private institutionRepo: Repository<Institution>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(requesterId: string, dto: CreateNoticeDto) {
    const requester = await this.getRequester(requesterId);
    const roleName = requester.role?.name as string;

    if (roleName === 'head_teacher') {
      if (!requester.institutionId) {
        throw new ForbiddenException(
          'No institution is assigned to your account',
        );
      }

      if (dto.institutionId && dto.institutionId !== requester.institutionId) {
        throw new ForbiddenException(
          'You can only publish notices to your own school',
        );
      }

      const notices = await this.createForInstitutions(
        [requester.institutionId],
        dto,
      );
      return { scope: 'own_school', count: notices.length, notices };
    }

    if (!['admin', 'officer', 'to', 'ato'].includes(roleName)) {
      throw new ForbiddenException('You cannot publish notices');
    }

    if (dto.institutionId) {
      const institution = await this.institutionRepo.findOneBy({
        id: dto.institutionId,
      });

      if (!institution) {
        throw new NotFoundException('Institution not found');
      }

      const notices = await this.createForInstitutions(
        [dto.institutionId],
        dto,
      );
      return { scope: 'institution', count: notices.length, notices };
    }

    const institutions = await this.institutionRepo.find({
      select: { id: true },
    });

    if (institutions.length === 0) {
      throw new BadRequestException(
        'No institutions are available for broadcasting',
      );
    }

    const notices = await this.createForInstitutions(
      institutions.map((institution) => institution.id),
      dto,
    );

    return { scope: 'all_schools', count: notices.length, notices };
  }

  async findAll(requesterId: string, query: NoticeQueryDto) {
    const requester = await this.getRequester(requesterId);
    const roleName = requester.role?.name as string;
    const qb = this.noticeRepo
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.institution', 'institution');

    if (['teacher', 'head_teacher'].includes(roleName)) {
      if (!requester.institutionId) {
        throw new ForbiddenException(
          'No institution is assigned to your account',
        );
      }

      qb.andWhere('notice.institutionId = :institutionId', {
        institutionId: requester.institutionId,
      });
    } else if (!['admin', 'officer', 'to', 'ato'].includes(roleName)) {
      throw new ForbiddenException('You cannot view notices');
    }

    if (query.institutionId) {
      if (
        ['teacher', 'head_teacher'].includes(roleName) &&
        query.institutionId !== requester.institutionId
      ) {
        throw new ForbiddenException(
          'You can only view notices for your own school',
        );
      }

      qb.andWhere('notice.institutionId = :filterInstitutionId', {
        filterInstitutionId: query.institutionId,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(notice.title ILIKE :search OR notice.content ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const allowedSortFields = ['id', 'title', 'createdAt'];
    const sortBy = allowedSortFields.includes(query.sortBy || '')
      ? query.sortBy
      : 'createdAt';

    return paginate(qb, { ...query, sortBy }, 'notice');
  }

  async findOne(requesterId: string, noticeId: string) {
    const requester = await this.getRequester(requesterId);
    const notice = await this.getNotice(noticeId);
    this.assertCanAccessNotice(requester, notice);
    return notice;
  }

  async update(requesterId: string, noticeId: string, dto: UpdateNoticeDto) {
    const requester = await this.getRequester(requesterId);
    const notice = await this.getNotice(noticeId);
    this.assertCanManageNotice(requester, notice);

    if (dto.title !== undefined) {
      notice.title = dto.title;
    }

    if (dto.content !== undefined) {
      notice.content = dto.content;
    }

    return this.noticeRepo.save(notice);
  }

  async remove(requesterId: string, noticeId: string) {
    const requester = await this.getRequester(requesterId);
    const notice = await this.getNotice(noticeId);
    this.assertCanManageNotice(requester, notice);
    await this.noticeRepo.remove(notice);
    return { message: 'Notice deleted successfully' };
  }

  private async createForInstitutions(
    institutionIds: string[],
    dto: CreateNoticeDto,
  ) {
    const notices = institutionIds.map((institutionId) =>
      this.noticeRepo.create({
        institutionId,
        title: dto.title,
        content: dto.content,
      }),
    );

    return this.noticeRepo.save(notices);
  }

  private async getRequester(requesterId: string) {
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: { institution: true, role: true },
    });

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    return requester;
  }

  private async getNotice(noticeId: string) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId },
      relations: { institution: true },
    });

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    return notice;
  }

  private assertCanAccessNotice(requester: User, notice: Notice) {
    const roleName = requester.role?.name as string;

    if (
      ['teacher', 'head_teacher'].includes(roleName) &&
      requester.institutionId !== notice.institutionId
    ) {
      throw new ForbiddenException(
        'You can only view notices for your own school',
      );
    }

    if (
      !['admin', 'officer', 'to', 'ato', 'teacher', 'head_teacher'].includes(
        roleName,
      )
    ) {
      throw new ForbiddenException('You cannot view this notice');
    }
  }

  private assertCanManageNotice(requester: User, notice: Notice) {
    const roleName = requester.role?.name as string;

    if (roleName === 'head_teacher') {
      if (requester.institutionId !== notice.institutionId) {
        throw new ForbiddenException(
          'You can only manage notices for your own school',
        );
      }
      return;
    }

    if (!['admin', 'officer', 'to', 'ato'].includes(roleName)) {
      throw new ForbiddenException('You cannot manage notices');
    }
  }
}
