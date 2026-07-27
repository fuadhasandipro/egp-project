import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TicketsService } from './tickets.service';
import { CreateInfrastructureRequestDto } from './dto/create-infrastructure-request.dto';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { Roles } from '../common/decorators/roles.decorator';

// ApiBearerAuth tells Swagger to send the login token with every request below.
// Without it the Authorize button does nothing for this controller.
@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Only a head teacher can ask for new furniture, benches, computers etc.
  @Roles('head_teacher')
  @Post('infrastructure')
  createInfrastructureRequest(
    @Body() dto: CreateInfrastructureRequestDto,
    @Request() req: any,
  ) {
    return this.ticketsService.createInfrastructureRequest(dto, req.user.id);
  }

  // A teacher or a head teacher can file a complaint.
  @Roles('teacher', 'head_teacher')
  @Post('complaints')
  createComplaint(@Body() dto: CreateComplaintDto, @Request() req: any) {
    return this.ticketsService.createComplaint(dto, req.user.id);
  }

  // Only a head teacher can escalate a complaint to the officer.
  @Roles('head_teacher')
  @Patch('complaints/:id/escalate')
  escalateComplaint(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.ticketsService.escalateComplaint(id, req.user.id);
  }

  // Everybody can see the list, but the service decides how much they can see.
  @Roles('teacher', 'head_teacher', 'to', 'ato', 'admin')
  @Get('complaints')
  findAllComplaints(@Query() query: QueryComplaintsDto, @Request() req: any) {
    return this.ticketsService.findAllComplaints(query, req.user);
  }

  // =============================================================
  // ASSETS. This is the complete CRUD of the Asset table.
  // =============================================================

  // CREATE. Only a head teacher can add an asset of his school.
  @Roles('head_teacher')
  @Post('assets')
  createAsset(@Body() dto: CreateAssetDto, @Request() req: any) {
    return this.ticketsService.createAsset(dto, req.user.id);
  }

  // READ MANY.
  @Roles('teacher', 'head_teacher', 'to', 'ato', 'admin')
  @Get('assets')
  findAllAssets(@Request() req: any) {
    return this.ticketsService.findAllAssets(req.user);
  }

  // READ ONE.
  @Roles('teacher', 'head_teacher', 'to', 'ato', 'admin')
  @Get('assets/:id')
  findOneAsset(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ticketsService.findOneAsset(id, req.user);
  }

  // UPDATE. Only a head teacher can fix his own school asset.
  @Roles('head_teacher')
  @Patch('assets/:id')
  updateAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
    @Request() req: any,
  ) {
    return this.ticketsService.updateAsset(id, dto, req.user.id);
  }

  // DELETE. Only a head teacher can delete his own school asset.
  @Roles('head_teacher')
  @Delete('assets/:id')
  removeAsset(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ticketsService.removeAsset(id, req.user.id);
  }

  // =============================================================
  // COMPLAINT ATTACHMENTS.
  // =============================================================

  // Add a file link to one complaint.
  @Roles('teacher', 'head_teacher')
  @Post('complaints/:id/attachments')
  addAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAttachmentDto,
    @Request() req: any,
  ) {
    return this.ticketsService.addAttachment(id, dto, req.user.id);
  }

  // See all the file links of one complaint.
  @Roles('teacher', 'head_teacher')
  @Get('complaints/:id/attachments')
  findAttachments(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ticketsService.findAttachments(id, req.user.id);
  }
}
