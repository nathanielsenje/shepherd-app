import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../../config/database.config';

@Module({
  controllers: [MembersController],
  providers: [MembersService, PrismaService],
  exports: [MembersService],
})
export class MembersModule {}
