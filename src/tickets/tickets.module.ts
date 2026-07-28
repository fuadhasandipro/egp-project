import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Complaint } from '../database/entities/complaint.entity';
import { ComplaintAttachment } from '../database/entities/complaint-attachment.entity';
import { InfrastructureRequest } from '../database/entities/infrastructure-request.entity';
import { Asset } from '../database/entities/asset.entity';
import { User } from '../database/entities/user.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

// forFeature tells Nest which tables this module is allowed to use.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Complaint,
      ComplaintAttachment,
      InfrastructureRequest,
      Asset,
      User,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
