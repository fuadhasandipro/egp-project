import { IsIn } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsIn(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';
}
