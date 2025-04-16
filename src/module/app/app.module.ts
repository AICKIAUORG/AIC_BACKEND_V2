import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/config/typeorm.config';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal : true,
    envFilePath : join(process.cwd(), '.env')
  }),
  TypeOrmModule.forRootAsync({
    useClass : TypeOrmConfig,
    inject : [TypeOrmConfig]
  }),
  MorganModule,
  AuthModule
],
  controllers: [],
  providers: [
    {
      provide : APP_INTERCEPTOR,
      useClass : MorganInterceptor("dev")
    }
  ],
})
export class AppModule {}
 