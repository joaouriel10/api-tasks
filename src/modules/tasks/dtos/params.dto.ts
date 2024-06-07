import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryListDto {
  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  id: string;
}
