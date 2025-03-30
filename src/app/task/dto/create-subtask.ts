import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateSubTaskDto {
    @ApiProperty()
    @IsNumber()
    taskId: number;

    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;
}
