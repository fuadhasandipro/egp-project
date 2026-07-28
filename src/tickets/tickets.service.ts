import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import { Complaint } from '../database/entities/complaint.entity';
import { ComplaintAttachment } from '../database/entities/complaint-attachment.entity';
import { InfrastructureRequest } from '../database/entities/infrastructure-request.entity';
import { Asset } from '../database/entities/asset.entity';
import { User } from '../database/entities/user.entity';
import { CreateInfrastructureRequestDto } from './dto/create-infrastructure-request.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { paginate } from '../common/helpers/paginate.helper';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(InfrastructureRequest)
    private readonly infraRepo: Repository<InfrastructureRequest>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(ComplaintAttachment)
    private readonly attachmentRepo: Repository<ComplaintAttachment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  // ---------------------------------------------------------------
  // HELPER: find the school id of the logged in user.
  // The JWT token only has id, email and role. It does not have the
  // school id. So we read the user row from the database.
  // ---------------------------------------------------------------
  async findMySchoolId(userId: string): Promise<string> {
    // Step 1: find the user in the database.
    const user = await this.userRepo.findOne({ where: { id: userId } });

    // Step 2: if the user is not there, stop.
    if (user == null) {
      throw new NotFoundException('User not found');
    }

    // Step 3: if the user has no school, stop.
    if (user.institutionId == null) {
      throw new BadRequestException('Your account has no school attached');
    }

    // Step 4: give back the school id.
    return user.institutionId;
  }

  // ---------------------------------------------------------------
  // POST /api/tickets/infrastructure
  // A head teacher asks for benches, computers, chairs etc.
  // ---------------------------------------------------------------
  async createInfrastructureRequest(
    dto: CreateInfrastructureRequestDto,
    userId: string,
  ): Promise<InfrastructureRequest> {
    // Step 1: find my school id.
    const schoolId = await this.findMySchoolId(userId);

    // Step 2: make a new row in memory.
    const request = this.infraRepo.create({
      institutionId: schoolId,
      itemType: dto.itemType,
      quantity: dto.quantity,
      status: 'Pending',
    });

    // Step 3: save the row in the database and give it back.
    return await this.infraRepo.save(request);
  }

  // ---------------------------------------------------------------
  // POST /api/tickets/complaints
  // A teacher or a head teacher files a complaint.
  // ---------------------------------------------------------------
  async createComplaint(
    dto: CreateComplaintDto,
    userId: string,
  ): Promise<Complaint> {
    // Step 1: find my school id.
    const schoolId = await this.findMySchoolId(userId);

    // Step 2: make a new row in memory.
    const complaint = this.complaintRepo.create({
      institutionId: schoolId,
      description: dto.description,
      severity: dto.severity,
      status: 'Open',
    });

    // Step 3: save the row in the database and give it back.
    return await this.complaintRepo.save(complaint);
  }

  // ---------------------------------------------------------------
  // PATCH /api/tickets/complaints/:id/escalate
  // A head teacher sends the complaint up to the officer,
  // and the officer gets an email.
  // ---------------------------------------------------------------
  async escalateComplaint(id: string, userId: string): Promise<Complaint> {
    // Step 1: find the complaint. Also load its school.
    const complaint = await this.complaintRepo.findOne({
      where: { id: id },
      relations: { institution: true },
    });

    // Step 2: if there is no such complaint, stop.
    if (complaint == null) {
      throw new NotFoundException(`Complaint with id ${id} not found`);
    }

    // Step 3: find my school id.
    const schoolId = await this.findMySchoolId(userId);

    // Step 4: own school rule. I can only escalate my own school complaint.
    if (complaint.institutionId != schoolId) {
      throw new ForbiddenException('This complaint is not from your school');
    }

    // Step 5: do not escalate the same complaint two times.
    if (complaint.status == 'Escalated') {
      throw new BadRequestException('This complaint is already escalated');
    }

    // Step 6: change the status and save it.
    complaint.status = 'Escalated';
    const updatedComplaint = await this.complaintRepo.save(complaint);

    // Step 7: send the email to the officers.
    await this.sendEmailToOfficer(updatedComplaint);

    // Step 8: give back the updated complaint.
    return updatedComplaint;
  }

  // ---------------------------------------------------------------
  // HELPER: send the escalation email.
  // In the database the officer roles are called 'to' (Thana Officer)
  // and 'ato' (Assistant Thana Officer). There is no role named 'officer'.
  // ---------------------------------------------------------------
  async sendEmailToOfficer(complaint: Complaint): Promise<void> {
    // Step 1: load all users together with their role.
    const allUsers = await this.userRepo.find({ relations: { role: true } });

    // Step 2: keep only the officer emails in a list.
    const officerEmails: string[] = [];

    for (const user of allUsers) {
      if (user.role == null) {
        continue;
      }

      if (user.role.name == 'to' || user.role.name == 'ato') {
        officerEmails.push(user.email);
      }
    }

    // Step 3: if there is no officer in the system, do nothing.
    if (officerEmails.length == 0) {
      return;
    }

    // Step 4: find the school name to write inside the email.
    let schoolName = 'Unknown School';

    if (complaint.institution != null) {
      schoolName = complaint.institution.name;
    }

    // Step 5: write the subject and the body.
    const subject = `Escalated Complaint (${complaint.severity}) - ${schoolName}`;

    const body = `A complaint has been escalated to you.

School: ${schoolName}
Severity: ${complaint.severity}
Complaint Id: ${complaint.id}

Description: ${complaint.description}`;

    // Step 6: send the mail. We do not wait for it, because a slow
    // mail server should not make the user wait.
    this.mailerService
      .sendMail({
        to: officerEmails,
        subject: subject,
        text: body,
      })
      .catch(console.error);
  }

  // ---------------------------------------------------------------
  // GET /api/tickets/complaints
  // Search + filter + sort + pagination + role based visibility.
  // ---------------------------------------------------------------
  async findAllComplaints(query: QueryComplaintsDto, user: any) {
    // Step 1: start a query. 'c' is just a short name for complaint.
    const qb = this.complaintRepo.createQueryBuilder('c');

    // Step 2: also bring the school of every complaint.
    qb.leftJoinAndSelect('c.institution', 'institution');

    // Step 3: FILTER. Only if the user sent a severity.
    if (query.severity) {
      qb.andWhere('c.severity = :severity', { severity: query.severity });
    }

    // Step 4: FILTER. Only if the user sent a status.
    if (query.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }

    // Step 5: SEARCH. ILIKE means match any part, ignoring capital letters.
    if (query.search) {
      qb.andWhere('c.description ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Step 6: RBAC. Admin, TO and ATO can see every complaint.
    // A teacher or a head teacher can only see his own school.
    const roleName = user.role.name;

    if (roleName != 'admin' && roleName != 'to' && roleName != 'ato') {
      const schoolId = await this.findMySchoolId(user.id);

      qb.andWhere('c.institutionId = :schoolId', { schoolId: schoolId });
    }

    // Step 7: SORT and PAGINATION are done by the shared helper.
    return await paginate(qb, query, 'c');
  }

  // ===============================================================
  // ASSET CRUD
  // An asset is a thing the school owns: a bench, a fan, a computer.
  // This is the complete CRUD: Create, Read, Update, Delete.
  // ===============================================================

  // ---------------------------------------------------------------
  // CREATE  ->  POST /api/tickets/assets
  // ---------------------------------------------------------------
  async createAsset(dto: CreateAssetDto, userId: string): Promise<Asset> {
    // Step 1: find my school id.
    const schoolId = await this.findMySchoolId(userId);

    // Step 2: make a new row in memory.
    const asset = this.assetRepo.create({
      institutionId: schoolId,
      name: dto.name,
      condition: dto.condition,
    });

    // Step 3: save the row in the database and give it back.
    return await this.assetRepo.save(asset);
  }

  // ---------------------------------------------------------------
  // READ MANY  ->  GET /api/tickets/assets
  // ---------------------------------------------------------------
  async findAllAssets(user: any): Promise<Asset[]> {
    // Step 1: read the role name of the logged in user.
    const roleName = user.role.name;

    // Step 2: admin, to and ato can see every asset of every school.
    if (roleName == 'admin' || roleName == 'to' || roleName == 'ato') {
      return await this.assetRepo.find({ relations: { institution: true } });
    }

    // Step 3: everybody else can only see his own school assets.
    const schoolId = await this.findMySchoolId(user.id);

    return await this.assetRepo.find({
      where: { institutionId: schoolId },
      relations: { institution: true },
    });
  }

  // ---------------------------------------------------------------
  // READ ONE  ->  GET /api/tickets/assets/:id
  // ---------------------------------------------------------------
  async findOneAsset(id: string, user: any): Promise<Asset> {
    // Step 1: find the asset. Also load its school.
    const asset = await this.assetRepo.findOne({
      where: { id: id },
      relations: { institution: true },
    });

    // Step 2: if there is no such asset, stop.
    if (asset == null) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    // Step 3: read the role name.
    const roleName = user.role.name;

    // Step 4: a teacher or a head teacher can only open his own school asset.
    if (roleName != 'admin' && roleName != 'to' && roleName != 'ato') {
      const schoolId = await this.findMySchoolId(user.id);

      if (asset.institutionId != schoolId) {
        throw new ForbiddenException('This asset is not from your school');
      }
    }

    // Step 5: give back the asset.
    return asset;
  }

  // ---------------------------------------------------------------
  // UPDATE  ->  PATCH /api/tickets/assets/:id
  // ---------------------------------------------------------------
  async updateAsset(
    id: string,
    dto: UpdateAssetDto,
    userId: string,
  ): Promise<Asset> {
    // Step 1: find the asset.
    const asset = await this.assetRepo.findOne({ where: { id: id } });

    // Step 2: if there is no such asset, stop.
    if (asset == null) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    // Step 3: own school rule.
    const schoolId = await this.findMySchoolId(userId);

    if (asset.institutionId != schoolId) {
      throw new ForbiddenException('This asset is not from your school');
    }

    // Step 4: change the name only if the user sent a name.
    if (dto.name != null) {
      asset.name = dto.name;
    }

    // Step 5: change the condition only if the user sent a condition.
    if (dto.condition != null) {
      asset.condition = dto.condition;
    }

    // Step 6: save the row and give it back.
    return await this.assetRepo.save(asset);
  }

  // ---------------------------------------------------------------
  // DELETE  ->  DELETE /api/tickets/assets/:id
  // ---------------------------------------------------------------
  async removeAsset(id: string, userId: string): Promise<any> {
    // Step 1: find the asset.
    const asset = await this.assetRepo.findOne({ where: { id: id } });

    // Step 2: if there is no such asset, stop.
    if (asset == null) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    // Step 3: own school rule.
    const schoolId = await this.findMySchoolId(userId);

    if (asset.institutionId != schoolId) {
      throw new ForbiddenException('This asset is not from your school');
    }

    // Step 4: delete the row from the database.
    await this.assetRepo.remove(asset);

    // Step 5: tell the user it is done.
    return { message: `Asset ${id} deleted` };
  }

  // ===============================================================
  // COMPLAINT ATTACHMENTS
  // An attachment is a file link, for example a photo of the
  // broken roof, saved against one complaint.
  // ===============================================================

  // ---------------------------------------------------------------
  // POST /api/tickets/complaints/:id/attachments
  // ---------------------------------------------------------------
  async addAttachment(
    complaintId: string,
    dto: CreateAttachmentDto,
    userId: string,
  ): Promise<ComplaintAttachment> {
    // Step 1: find the complaint.
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
    });

    // Step 2: if there is no such complaint, stop.
    if (complaint == null) {
      throw new NotFoundException(`Complaint with id ${complaintId} not found`);
    }

    // Step 3: own school rule.
    const schoolId = await this.findMySchoolId(userId);

    if (complaint.institutionId != schoolId) {
      throw new ForbiddenException('This complaint is not from your school');
    }

    // Step 4: make a new attachment row in memory.
    const attachment = this.attachmentRepo.create({
      complaintId: complaint.id,
      fileUrl: dto.fileUrl,
    });

    // Step 5: save the row and give it back.
    return await this.attachmentRepo.save(attachment);
  }

  // ---------------------------------------------------------------
  // GET /api/tickets/complaints/:id/attachments
  // ---------------------------------------------------------------
  async findAttachments(
    complaintId: string,
    userId: string,
  ): Promise<ComplaintAttachment[]> {
    // Step 1: find the complaint.
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
    });

    // Step 2: if there is no such complaint, stop.
    if (complaint == null) {
      throw new NotFoundException(`Complaint with id ${complaintId} not found`);
    }

    // Step 3: own school rule.
    const schoolId = await this.findMySchoolId(userId);

    if (complaint.institutionId != schoolId) {
      throw new ForbiddenException('This complaint is not from your school');
    }

    // Step 4: give back all the attachments of this complaint.
    return await this.attachmentRepo.find({
      where: { complaintId: complaint.id },
    });
  }
}
