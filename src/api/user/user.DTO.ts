import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class UserDTO {
  @IsString()
  nome: string;

  @IsString()
  cognome: string;

  @IsString()
  ruolo: string; 
  
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8 })
  password: string;
}