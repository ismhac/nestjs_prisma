import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient {
    constructor(private configService: ConfigService) {
        super({
            datasources: {
                db: {
                    // url: 'postgresql://postgres:12345@localhost:5434/testdb?schema=public'
                    url: configService.get<string>('DATABASE_URL'),
                }
            }
        });
    }
}
