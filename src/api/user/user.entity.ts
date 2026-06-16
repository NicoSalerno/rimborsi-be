export type User = {
    id?: string;
    nome: string;
    cognome: string;
    email: string;
    ruolo: "dipendente" | "responsabile";
}