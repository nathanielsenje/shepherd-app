import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../../config/database.config';
import { CreateUserDto, UpdateUserDto, UpdateUserPreferencesDto } from './dto/user.dto';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Get all users (Super Admin / Admin only)
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        photo: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        photo: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Create a new user (Admin only)
   */
  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(
      createUserDto.password,
      parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        photo: createUserDto.photo,
        bio: createUserDto.bio,
        role: createUserDto.role,
        status: createUserDto.status || 'ACTIVE', // Admin can create active users directly
        emailVerified: true, // Admin-created users are auto-verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        photo: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto, requestingUserId: string, requestingUserRole: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions: users can update themselves, admins can update anyone
    const isAdmin = requestingUserRole === 'SUPER_ADMIN' || requestingUserRole === 'ADMIN';
    const isSelf = requestingUserId === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Regular users cannot change their role or status
    if (!isAdmin && (updateUserDto.role || updateUserDto.status)) {
      throw new ForbiddenException('You cannot change your role or status');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        photo: true,
        bio: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user (Admin only)
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Approve user (change status from PENDING to ACTIVE)
   */
  async approve(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'PENDING') {
      throw new BadRequestException('User is not pending approval');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('User must verify email before approval');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    // Send approval notification
    await this.emailService.sendUserApprovedEmail(
      updatedUser.email,
      updatedUser.firstName,
    );

    return updatedUser;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string) {
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await this.prisma.userPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, updatePreferencesDto: UpdateUserPreferencesDto) {
    // Check if preferences exist
    const existingPreferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existingPreferences) {
      return this.prisma.userPreferences.update({
        where: { userId },
        data: updatePreferencesDto,
      });
    } else {
      return this.prisma.userPreferences.create({
        data: {
          userId,
          ...updatePreferencesDto,
        },
      });
    }
  }
}
