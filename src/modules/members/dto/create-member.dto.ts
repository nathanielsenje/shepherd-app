import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, enum: ['NEWCOMER', 'VISITOR', 'REGULAR_ATTENDER', 'MEMBER', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['NEWCOMER', 'VISITOR', 'REGULAR_ATTENDER', 'MEMBER', 'INACTIVE'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  householdId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  firstVisitDate?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isChild?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  consentDataStorage?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  consentCommunication?: boolean;
}

export class UpdateMemberDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['NEWCOMER', 'VISITOR', 'REGULAR_ATTENDER', 'MEMBER', 'INACTIVE'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  householdId?: string;
}
