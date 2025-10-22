import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { EncryptionUtil } from '../../utils/encryption.util';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const data: any = {
      ...createMemberDto,
    };

    // Encrypt sensitive fields
    if (createMemberDto.phone) {
      data.phone = EncryptionUtil.encrypt(createMemberDto.phone);
    }

    if (createMemberDto.dateOfBirth) {
      data.dateOfBirth = EncryptionUtil.encrypt(createMemberDto.dateOfBirth);
    }

    if (createMemberDto.consentDataStorage || createMemberDto.consentCommunication) {
      data.consentDate = new Date();
    }

    const member = await this.prisma.member.create({
      data,
      include: {
        household: true,
      },
    });

    return this.decryptMember(member);
  }

  async findAll(params?: {
    status?: string;
    isChild?: boolean;
    householdId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.isChild !== undefined) {
      where.isChild = params.isChild;
    }

    if (params?.householdId) {
      where.householdId = params.householdId;
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: {
          household: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members.map((member) => this.decryptMember(member)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        household: true,
        milestones: true,
        groupMemberships: {
          include: {
            group: true,
          },
        },
        teamMemberships: {
          include: {
            team: true,
          },
        },
        ministryParticipation: {
          include: {
            ministry: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.decryptMember(member);
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const existing = await this.prisma.member.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    const data: any = { ...updateMemberDto };

    if (updateMemberDto.phone) {
      data.phone = EncryptionUtil.encrypt(updateMemberDto.phone);
    }

    if (updateMemberDto.dateOfBirth) {
      data.dateOfBirth = EncryptionUtil.encrypt(updateMemberDto.dateOfBirth);
    }

    const member = await this.prisma.member.update({
      where: { id },
      data,
      include: {
        household: true,
      },
    });

    return this.decryptMember(member);
  }

  async remove(id: string) {
    const existing = await this.prisma.member.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Member deleted successfully' };
  }

  async getEngagement(id: string) {
    const member = await this.findOne(id);

    const groupsCount = await this.prisma.groupMember.count({
      where: { memberId: id, isActive: true },
    });

    const teamsCount = await this.prisma.teamMember.count({
      where: { memberId: id, isActive: true },
    });

    const ministriesCount = await this.prisma.ministryParticipant.count({
      where: { memberId: id, isActive: true },
    });

    const partnership = await this.prisma.covenantPartnership.findUnique({
      where: { memberId: id },
    });

    return {
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        status: member.status,
      },
      engagement: {
        groups: groupsCount,
        teams: teamsCount,
        ministries: ministriesCount,
        isCovenantPartner: partnership?.status === 'ACTIVE',
      },
      milestones: member.milestones,
    };
  }

  async getUnconnected() {
    const members = await this.prisma.member.findMany({
      where: {
        deletedAt: null,
        isChild: false,
        status: {
          in: ['REGULAR_ATTENDER', 'MEMBER'],
        },
      },
      include: {
        groupMemberships: {
          where: { isActive: true },
        },
      },
    });

    const unconnected = members.filter((member) => member.groupMemberships.length === 0);

    return unconnected.map((member) => this.decryptMember(member));
  }

  private decryptMember(member: any) {
    if (!member) return member;

    const decrypted = { ...member };

    if (decrypted.phone) {
      try {
        decrypted.phone = EncryptionUtil.decrypt(decrypted.phone);
      } catch (error) {
        decrypted.phone = null;
      }
    }

    if (decrypted.dateOfBirth) {
      try {
        decrypted.dateOfBirth = EncryptionUtil.decrypt(decrypted.dateOfBirth);
      } catch (error) {
        decrypted.dateOfBirth = null;
      }
    }

    return decrypted;
  }
}
