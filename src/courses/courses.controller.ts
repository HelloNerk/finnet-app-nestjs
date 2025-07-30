import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import { CourseDto } from './dto/course.dto';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('create')
  async createCourse(@Body() courseData: CreateCourseDto): Promise<CourseDto> {
      return this.coursesService.createCourse(courseData);
  }

  @Post('createMany')
  async createManyCourses(@Body() coursesData: CreateCourseDto[]): Promise<CourseDto[]> {
      return this.coursesService.createManyCourses(coursesData);
  }

  @Get('findAll')
  async findAllCourses(): Promise<CourseDto[]> {
      return this.coursesService.findAllCourses();
  }

  @Get(':id')
  async findCourseById(@Param('id') id: number): Promise<CourseDto | null> {
      return this.coursesService.findCourseById(id);
  }

  @Post('update/:id')
  async updateCourse(@Param('id') id: number, @Body() courseData: Partial<CreateCourseDto>): Promise<CourseDto | null> {
      return this.coursesService.updateCourse(id, courseData);
  }

  @Delete('delete/:id')
  async deleteCourse(@Param('id') id: number): Promise<void> {
      return this.coursesService.deleteCourse(id);
  }

}
