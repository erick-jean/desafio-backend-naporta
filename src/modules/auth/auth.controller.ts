import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ResponseAuthDto } from './dto/response-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza o login do usuário' })
  @ApiCreatedResponse({ type: ResponseAuthDto })
  @Post('login')
  login(@Body() signInDto: SignInDto): Promise<{ access_token: string }> {
    return this.authService.login(signInDto);
  }
}
