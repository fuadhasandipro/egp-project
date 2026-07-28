import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Profile } from '../database/entities/profile.entity';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/helpers/paginate.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    private mailerService: MailerService,
  ) { }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { profile: true, institution: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createOfficer(dto: CreateOfficerDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const role = await this.roleRepo.findOne({
      where: { name: dto.roleName as any },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = this.userRepo.create({
      email: dto.email,
      passwordHash,
      role,
      institutionId: dto.institutionId,
    });

    const savedUser = await this.userRepo.save(newUser);

    this.mailerService.sendMail({
      to: dto.email,
      subject: 'Your EGP Officer Account',
      text: 'Your account has been created. Temporary password: ' + tempPassword,
    }).catch(console.error);

    const { passwordHash: _, ...result } = savedUser;
    return result;
  }

  async findAllUsers(query: PaginationQueryDto & { role?: string; status?: string }) {
    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.institution', 'institution');

    if (query.search) {
      qb.andWhere('(user.email ILIKE :s OR profile.fullName ILIKE :s)', { s: `%${query.search}%` });
    }
    if (query.role) {
      qb.andWhere('role.name = :role', { role: query.role });
    }
    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    return paginate(qb, query, 'user');
  }

}
