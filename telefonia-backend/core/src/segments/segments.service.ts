import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Segment } from './entities/segment.entity';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(Segment)
    private readonly segmentRepository: Repository<Segment>,
  ) {}

  async create(createSegmentDto: CreateSegmentDto): Promise<Segment> {
    const existingSegmentByValue = await this.segmentRepository.findOne({
      where: { value: createSegmentDto.value },
    });
    if (existingSegmentByValue) {
      throw new ConflictException('Segment com o valor \'' + createSegmentDto.value + '\' já existe.');
    }

    // Opcional: Verificar também por nome, se o nome também deve ser único
    // const existingSegmentByName = await this.segmentRepository.findOne({
    //   where: { name: createSegmentDto.name },
    // });
    // if (existingSegmentByName) {
    //   throw new ConflictException('Segment com o nome \'' + createSegmentDto.name + '\' já existe.');
    // }

    const segment = this.segmentRepository.create(createSegmentDto);
    return this.segmentRepository.save(segment);
  }

  async findAll(): Promise<Segment[]> {
    return this.segmentRepository.find();
  }

  async findOne(id: string): Promise<Segment> {
    const segment = await this.segmentRepository.findOne({ where: { id } });
    if (!segment) {
      throw new NotFoundException('Segment com ID \'' + id + '\' não encontrado.');
    }
    return segment;
  }

  async findByValue(value: string): Promise<Segment | null> {
    return this.segmentRepository.findOne({ where: { value } });
  }

  async update(id: string, updateSegmentDto: UpdateSegmentDto): Promise<Segment> {
    const segment = await this.findOne(id); // Garante que o segmento exista

    if (updateSegmentDto.value) {
      const existingSegmentByValue = await this.segmentRepository.findOne({
        where: { value: updateSegmentDto.value },
      });
      // Se o valor está sendo alterado para um que já existe E pertence a um ID diferente
      if (existingSegmentByValue && existingSegmentByValue.id !== id) {
        throw new ConflictException('Segment com o valor \'' + updateSegmentDto.value + '\' já existe.');
      }
    }
    
    // Opcional: lógica similar para 'name' se também for único

    Object.assign(segment, updateSegmentDto);
    return this.segmentRepository.save(segment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.segmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Segment com ID \'' + id + '\' não encontrado.');
    }
  }
}
