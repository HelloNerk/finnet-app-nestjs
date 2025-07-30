import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course) 
        private readonly courseRepository: Repository<Course>
    ){}

    async createCourse(courseData: Partial<CreateCourseDto>): Promise<Course> {
        const course = this.courseRepository.create(courseData);
        return this.courseRepository.save(course);
    }

    async createManyCourses(coursesData: Partial<CreateCourseDto>[]): Promise<Course[]> {
        const courses = coursesData.map(courseData => this.courseRepository.create(courseData));
        return this.courseRepository.save(courses);
    }


    async findAllCourses(): Promise<Course[]> {
        return this.courseRepository.find();
    }




    async findCourseById(id: number): Promise<Course | null> {
        return this.courseRepository.findOne({ where: { id } });
    }


    async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | null> {
        await this.courseRepository.update(id, courseData);
        return this.findCourseById(id);
    }

    async deleteCourse(id: number): Promise<void> {
        await this.courseRepository.delete(id);
    }

}
