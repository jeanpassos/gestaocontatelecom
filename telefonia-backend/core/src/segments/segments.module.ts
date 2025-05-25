import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Segment } from './entities/segment.entity';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Segment])],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  exports: [SegmentsService], // Exporte se outros módulos precisarem usar SegmentsService
})
export class SegmentsModule {}
