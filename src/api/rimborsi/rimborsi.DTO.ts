import { IsNumber, IsString } from "class-validator";

export class AddRichiestaDTO {

  @IsString()
  dataSpesa: Date;

  @IsNumber()
  categoria: string;

  @IsNumber()
  importo: number; 

  @IsString()
  descrizione: string;
}