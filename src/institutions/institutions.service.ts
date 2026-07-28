import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from '../database/entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginate } from '../common/helpers/paginate.helper';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepo: Repository<Institution>,
  ) {}

  async create(dto: CreateInstitutionDto) {
    const existing = await this.institutionRepo.findOne({ where: { eiin: dto.eiin } });
    if (existing) {
      throw new ConflictException('Institution with this EIIN already exists');
    }
    const institution = this.institutionRepo.create(dto);
    return this.institutionRepo.save(institution);
  }

  async findAll(query: PaginationQueryDto, user: any) {
    const qb = this.institutionRepo.createQueryBuilder('institution');

    if (user.role.name === 'teacher' || user.role.name === 'head_teacher') {
      qb.andWhere('institution.id = :id', { id: user.institutionId });
    }

    if (query.search) {
      qb.andWhere('(institution.name ILIKE :s OR institution.eiin ILIKE :s)', { s: `%${query.search}%` });
    }

    return paginate(qb, query, 'institution');
  }

  async findOne(id: string, user?: any) {
    if (user && (user.role.name === 'teacher' || user.role.name === 'head_teacher')) {
      if (id !== user.institutionId) {
        throw new ForbiddenException('You can only view your assigned institution');
      }
    }

    const institution = await this.institutionRepo.findOne({
      where: { id },
      relations: { users: true, assets: true },
    });
    if (!institution) {
      throw new NotFoundException('Institution not found');
    }
    return institution;
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    const institution = await this.findOne(id);
    
    if (dto.eiin && dto.eiin !== institution.eiin) {
      const existing = await this.institutionRepo.findOne({ where: { eiin: dto.eiin } });
      if (existing) {
        throw new ConflictException('Institution with this EIIN already exists');
      }
    }

    Object.assign(institution, dto);
    return this.institutionRepo.save(institution);
  }

  async remove(id: string) {
    const institution = await this.findOne(id);
    return this.institutionRepo.remove(institution);
  }
}
