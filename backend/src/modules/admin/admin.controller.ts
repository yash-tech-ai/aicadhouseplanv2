import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get system statistics (Admin only)' })
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('parameters')
  @ApiOperation({ summary: 'Get all parameter definitions (Admin only)' })
  async getParameters() {
    return this.adminService.getParameters();
  }

  @Post('parameters')
  @ApiOperation({ summary: 'Create a new parameter definition (Admin only)' })
  async createParameter(@Body() data: any) {
    return this.adminService.createParameter(data);
  }

  @Put('parameters/:id')
  @ApiOperation({ summary: 'Update parameter definition (Admin only)' })
  async updateParameter(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateParameter(id, data);
  }

  @Delete('parameters/:id')
  @ApiOperation({ summary: 'Delete parameter definition (Admin only)' })
  async deleteParameter(@Param('id') id: string) {
    await this.adminService.deleteParameter(id);
    return { message: 'Parameter deleted successfully' };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Put('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  async toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }
}
