export type StatoRimborso = 'in_attesa' | 'approvato' | 'rifiutato' | 'liquidato';

export interface Rimborso {
  RichiestaID: number;
  DataInserimento: string;         
  DataSpesa: string;
  Importo: number;
  Descrizione: string;
  RiferimentoGiustificativo: string | null;
  Stato: StatoRimborso;
  DataValutazione: string | null;
  MotivazioneRifiuto: string | null;
  DataLiquidazione: string | null;

  // Campi dalla join con CategoriaSpesa
  CategoriaID: number;
  CategoriaDescrizione: string;

  // Campi dalla join con Utente (dipendente)
  UtenteID: number;
  Nome: string;
  Cognome: string;
  Email: string;
}