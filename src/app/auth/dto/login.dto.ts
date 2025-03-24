import { ApiProperty } from "@nestjs/swagger";

class LoginDto {
  @ApiProperty()
  username: string;
  
  @ApiProperty()
  password: string;
}

export {
  LoginDto
}