import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { Segment } from './entities/segment.entity';

@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSegmentDto: CreateSegmentDto): Promise<Segment> {
    return this.segmentsService.create(createSegmentDto);
  }

  @Get()
  findAll(): Promise<Segment[]> {
    return this.segmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Segment> {
    return this.segmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSegmentDto: UpdateSegmentDto,
  ): Promise<Segment> {
    return this.segmentsService.update(id, updateSegmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.segmentsService.remove(id);
  }
}
