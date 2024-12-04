import { Module } from '@nestjs/common';
import { BdServicesService } from './bd-services.services';

@Module({
  providers: [BdServicesService],
  exports: [BdServicesService],
})
export class BdServicesModule {}
