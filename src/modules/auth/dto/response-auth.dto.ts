import { ApiProperty } from '@nestjs/swagger';
export class ResponseAuthDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
  })
  access_token!: string;
}
