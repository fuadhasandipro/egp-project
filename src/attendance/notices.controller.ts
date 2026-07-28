import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticeQueryDto } from './dto/notice-query.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticesService } from './notices.service';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller('api/notices')
export class NoticesController {
  constructor(private noticesService: NoticesService) {}

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher')
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateNoticeDto) {
    return this.noticesService.create(req.user.id, dto);
  }

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher', 'teacher')
  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: NoticeQueryDto,
  ) {
    return this.noticesService.findAll(req.user.id, query);
  }

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher', 'teacher')
  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.noticesService.findOne(req.user.id, id);
  }

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher')
  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.noticesService.update(req.user.id, id, dto);
  }

  @Roles('admin', 'officer', 'to', 'ato', 'head_teacher')
  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.noticesService.remove(req.user.id, id);
  }
}
