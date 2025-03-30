import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ) { }
  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    try {
      let result = await this.categoryRepository.save(createCategoryDto)
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.categoryRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(error);     
    }
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
