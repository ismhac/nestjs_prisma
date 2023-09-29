import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(authDto: AuthDto) {
        const { email, password } = authDto;
        const hashPassword = await argon.hash(password)
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: email,
                    hashPassword: hashPassword,
                },
                select: {
                    id: true,
                    email: true,
                    hashPassword: true, // :false if you don't want to return this field
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })
            return user;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ForbiddenException('Email already exists')
            }
        }
    }

    async login(authDto: AuthDto) {
        const { email, password } = authDto;
        const user = await this.prismaService.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            throw new ForbiddenException('User not found')
        }

        const isPasswordValid = await argon.verify(user.hashPassword, password)
        if (!isPasswordValid) {
            throw new ForbiddenException('Incorrect password')
        }

        delete user.hashPassword; // remove hashPassword from response
        return this.signJwtToken(user.id, user.email); // return jwt token
    }

    async signJwtToken(userId: String, email: String)
        : Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email: email
        }
        const jwtString = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '10m'
        })

        return {
            access_token: jwtString
        }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { email: username }
        });
        if (user && await this.isValidPassword(user.hashPassword, pass)) {
            delete user.hashPassword;
            return user;
        }
        return null;
    }

    async isValidPassword(hashPassword: string, password: string): Promise<boolean> {
        return await argon.verify(hashPassword, password);
    }
}
