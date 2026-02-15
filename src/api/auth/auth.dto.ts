import { IsEmail, IsString, IsStrongPassword, IsUrl, Matches, MinLength } from "class-validator";

export class AddUserDTO {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsUrl()
    picture: string;

    @IsEmail()
    username: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8
    })
    password: string;
}