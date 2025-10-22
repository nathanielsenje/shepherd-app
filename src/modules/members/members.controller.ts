import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')
  @ApiOperation({ summary: 'Create a new member' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isChild', required: false, type: Boolean })
  @ApiQuery({ name: 'householdId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('isChild') isChild?: boolean,
    @Query('householdId') householdId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.membersService.findAll({
      status,
      isChild,
      householdId,
      page,
      limit,
    });
  }

  @Get('unconnected')
  @ApiOperation({ summary: 'Get members not in any connect group' })
  getUnconnected() {
    return this.membersService.getUnconnected();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Get(':id/engagement')
  @ApiOperation({ summary: 'Get member engagement dashboard' })
  getEngagement(@Param('id') id: string) {
    return this.membersService.getEngagement(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')
  @ApiOperation({ summary: 'Update member' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_STAFF')
  @ApiOperation({ summary: 'Soft delete member' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
