import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inspection } from '../database/entities/inspection.entity';
import { StudentStatistic } from '../database/entities/student-statistic.entity';
import { TeacherTraining } from '../database/entities/teacher-training.entity';
import { TrainingProgram } from '../database/entities/training-program.entity';
import { User } from '../database/entities/user.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { QueryInspectionDto } from './dto/query-inspection.dto';
import { CreateStudentStatDto } from './dto/create-student-stat.dto';
import { UpdateStudentStatDto } from './dto/update-student-stat.dto';
import { AssignTrainingDto } from './dto/assign-training.dto';
import { paginate } from '../common/helpers/paginate.helper';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,
    @InjectRepository(StudentStatistic)
    private studentStatRepo: Repository<StudentStatistic>,
    @InjectRepository(TeacherTraining)
    private teacherTrainingRepo: Repository<TeacherTraining>,
    @InjectRepository(TrainingProgram)
    private trainingProgramRepo: Repository<TrainingProgram>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  async create(dto: CreateInspectionDto, inspectorId: string) {
    const inspection = this.inspectionRepo.create({
      institutionId: dto.institutionId,
      score: dto.score,
      notes: dto.notes,
      inspectorId: inspectorId,
    });

    return this.inspectionRepo.save(inspection);
  }

  async findAll(query: QueryInspectionDto, currentUser: any) {
    const qb = this.inspectionRepo.createQueryBuilder('inspection');


    if (currentUser.role.name === 'head_teacher') {
      const user = await this.userRepo.findOne({
        where: { id: currentUser.id },
      });
      qb.andWhere('inspection.institutionId = :institutionId', {
        institutionId: user?.institutionId,
      });
    }

    if (query.institutionId) {
      qb.andWhere('inspection.institutionId = :filterInstitutionId', {
        filterInstitutionId: query.institutionId,
      });
    }

    if (query.inspectorId) {
      qb.andWhere('inspection.inspectorId = :inspectorId', {
        inspectorId: query.inspectorId,
      });
    }

    const sortBy = query.sortBy || 'score';
    qb.orderBy(`inspection.${sortBy}`, query.order);

    return paginate(qb, query, 'inspection');
  }



  async createStudentStat(dto: CreateStudentStatDto) {
    const stat = this.studentStatRepo.create(dto);
    return this.studentStatRepo.save(stat);
  }

  async findAllStudentStats() {
    return this.studentStatRepo.find();
  }

  async findOneStudentStat(id: string) {
    const stat = await this.studentStatRepo.findOne({ where: { id } });
    if (!stat) {
      throw new NotFoundException('Student stat not found');
    }
    return stat;
  }

  async updateStudentStat(id: string, dto: UpdateStudentStatDto) {
    const stat = await this.findOneStudentStat(id);
    Object.assign(stat, dto);
    return this.studentStatRepo.save(stat);
  }

  async removeStudentStat(id: string) {
    const stat = await this.findOneStudentStat(id);
    return this.studentStatRepo.remove(stat);
  }


  async assignTraining(dto: AssignTrainingDto) {
    const teacher = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const training = await this.trainingProgramRepo.findOne({
      where: { id: dto.trainingId },
    });
    if (!training) {
      throw new NotFoundException('Training program not found');
    }

    const record = this.teacherTrainingRepo.create({
      userId: dto.userId,
      trainingId: dto.trainingId,
      completionDate: dto.completionDate,
    });

    return this.teacherTrainingRepo.save(record);
  }
}
