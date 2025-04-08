import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNumber()
    categoryId: number;

    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty({ default: null })
    assignUserId: number;
}
