import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationsService } from './organizations/organizations.service';
import { OrganizationsController } from './organizations/organizations.controller';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [OrganizationsModule],
  controllers: [AppController, OrganizationsController],
  providers: [AppService, OrganizationsService],
})
export class AppModule {}
