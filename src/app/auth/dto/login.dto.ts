import { ApiProperty } from "@nestjs/swagger";

class LoginDto {
  @ApiProperty()
  username: string;
  
  @ApiProperty()
  password: string;
}

class SignUpDto extends LoginDto{}
export {
  LoginDto,
  SignUpDto
}