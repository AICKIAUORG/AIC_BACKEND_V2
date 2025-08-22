import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommissionDto {
    @ApiProperty()
    @IsString()
    name : string
}

export class UpdateCommissionDto {
    @ApiProperty()
    @IsString()
    new_name : string
    @ApiProperty()
    @IsString()
    commission_id : string
}