import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNumber()
    categoryId: number;
}
