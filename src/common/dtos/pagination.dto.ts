import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginetionDto {
  
  @ApiProperty({
    default: 10,
    description: "Cuantos producto quieres ver",
  })
  @IsOptional()
  @IsPositive()
  @Type( () => Number )
  limit?: number;

  @ApiProperty({
    default: 0,
    description: "Cuantos producto quieres saltar",
  })
  @IsOptional()
  @Min( 0 )
  @Type( () => Number )
  offset?: number;
}