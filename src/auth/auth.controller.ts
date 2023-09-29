import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Public, ResponseMessage, UserDecorator } from "../decorators/customize";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @ResponseMessage('User registered successfully')
  handleRegister(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @Public()
  @Post('login')
  @ResponseMessage('User logged in successfully')
  handleLogin(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get('profile')
  handleGetProfile(@UserDecorator() user: any) {
    return user;
  }
}
