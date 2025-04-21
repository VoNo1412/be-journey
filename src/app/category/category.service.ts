import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
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
}
