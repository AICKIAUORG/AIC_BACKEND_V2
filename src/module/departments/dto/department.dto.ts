import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateDepartmentDto {
    @ApiProperty()
    @IsString()
    name : string
    @ApiProperty()
    @IsString()
    commission_id : string
}

export class UpdateDepartmentDto {
    @ApiProperty()
    @IsString()
    new_name : string
    @ApiProperty()
    @IsString()
    department_id : string
}
