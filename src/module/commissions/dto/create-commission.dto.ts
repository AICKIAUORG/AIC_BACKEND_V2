import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommissionDto {
    @ApiProperty()
    @IsString()
    name : string
}
