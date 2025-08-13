import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
    @ApiPropertyOptional({ 
        description: 'Page number (0-based)', 
        example: 0, 
        minimum: 0,
        default: 0 
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(0, { message: 'Page must be 0 or greater' })
    page?: number;

    @ApiPropertyOptional({ 
        description: 'Number of items per page', 
        example: 10, 
        minimum: 1,
        maximum: 100,
        default: 10 
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be 1 or greater' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    limit?: number;
}