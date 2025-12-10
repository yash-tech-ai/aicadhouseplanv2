import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService, RegisterDto } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Request() req: any) {
    return this.authService.login(req.user.email, req.body.password);
  }

  @Post('login-direct')
  @ApiOperation({ summary: 'Direct login (alternative endpoint)' })
  async loginDirect(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
