import { Request, Response, NextFunction } from "express";
import { createConnection } from "../connection";
import { TypedRequest } from "../../lib/typed-request.interface";
import { AddRichiestaDTO } from "./rimborsi.DTO";

export const addRichiesta = async (req: TypedRequest<AddRichiestaDTO>, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.UtenteID) {
    return res.status(401).json({ error: "Utente non autenticato o token mancante" });
  }

  const { dataSpesa, categoria, importo, descrizione } = req.body;

  if (!dataSpesa || !categoria || !importo || !descrizione) {
    return res.status(400).json({ error: "Inserire tutti i parametri obbligatori: dataSpesa, categoria, importo, descrizione" });
  }

  const categoriaNum = Number(categoria);
  if (isNaN(categoriaNum) || categoriaNum <= 0) {
    return res.status(400).json({ error: "La categoria deve essere un ID numerico valido" });
  }

  if (importo <= 0) {
    return res.status(400).json({ error: "L'importo deve essere un numero positivo" });
  }

  const dataSpesaDate = new Date(dataSpesa);
  if (isNaN(dataSpesaDate.getTime())) {
    return res.status(400).json({ error: "Data spesa non valida" });
  }

  const conn = await createConnection();

  try {
    const [catRows] = await conn.query("SELECT CategoriaID FROM CategoriaSpesa WHERE CategoriaID = ?", [categoriaNum]);
    if ((catRows as any[]).length === 0) {
      return res.status(404).json({ error: "Categoria non trovata" });
    }

    await conn.query(
      "INSERT INTO RichiestaRimborso (DataSpesa, CategoriaID, Importo, Descrizione, DipendenteID) VALUES (?, ?, ?, ?, ?)",
      [dataSpesa, categoriaNum, importo, descrizione, user.UtenteID]
    );

    return res.status(201).json(
      { success: true, 
        message: "Richiesta di rimborso creata con successo" 
      });
  } catch (err: any) {
    next(err);
  }
};

export const getAllRimborsi = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  const {stato, dipendente, dataDa, dataA } = req.query;

  const conn = await createConnection();
  try {
    let query = `
      SELECT 
        r.RichiestaID, r.DataInserimento, r.DataSpesa, r.Importo, r.Descrizione,
        r.RiferimentoGiustificativo, r.Stato, r.DataValutazione, r.MotivazioneRifiuto, r.DataLiquidazione,
        c.CategoriaID, c.Descrizione AS CategoriaDescrizione,
        u.UtenteID, u.Nome, u.Cognome, u.Email
      FROM RichiestaRimborso r
      JOIN CategoriaSpesa c ON r.CategoriaID = c.CategoriaID
      JOIN Utente u ON r.DipendenteID = u.UtenteID
      WHERE 1=1
    `;

    const params: any[] = [];

    if (user.Ruolo === 'dipendente') {
      query += ' AND r.DipendenteID = ?';
      params.push(user.UtenteID);
    }

    if (stato) {
      query += ' AND r.Stato = ?';
      params.push(stato);
    }

    if (dipendente && user.Ruolo === 'responsabile') {
      query += ' AND r.DipendenteID = ?';
      params.push(Number(dipendente));
    }

    if (dataDa) {
      query += ' AND r.DataSpesa >= ?';
      params.push(dataDa);
    }

    if (dataA) {
      query += ' AND r.DataSpesa <= ?';
      params.push(dataA);
    }

    query += ' ORDER BY r.DataInserimento DESC';

    const [rows] = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getRimborsoById = async (
  req: Request, 
  res: Response, 
  next: NextFunction) => {
  const user = (req as any).user;

  const { id } = req.params;
  const idNum = Number(id);
  if (idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query(
      `SELECT 
        r.RichiestaID, r.DataInserimento, r.DataSpesa, r.Importo, r.Descrizione,
        r.RiferimentoGiustificativo, r.Stato, r.DataValutazione, r.MotivazioneRifiuto, r.DataLiquidazione,
        c.CategoriaID, c.Descrizione AS CategoriaDescrizione,
        u.UtenteID, u.Nome, u.Cognome, u.Email
      FROM RichiestaRimborso r
      JOIN CategoriaSpesa c ON r.CategoriaID = c.CategoriaID
      JOIN Utente u ON r.DipendenteID = u.UtenteID
      WHERE r.RichiestaID = ?`,
      [idNum]
    );

    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];
    if (user.Ruolo === 'dipendente' && richiesta.UtenteID !== user.UtenteID) {
      return res.status(403).json({ error: "Accesso negato" });
    }

    return res.json(richiesta);
  } catch (err) {
    next(err);
  }
};

export const updateRichiesta = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  const { id } = req.params;
  const { dataSpesa, categoria, importo, descrizione } = req.body;

  if (!dataSpesa && !categoria && !importo && !descrizione) {
    return res.status(400).json({ error: "Nessun campo da modificare" });
  }

  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];

    if (richiesta.DipendenteID !== user.UtenteID) {
      return res.status(403).json({ error: "Non puoi modificare una richiesta altrui" });
    }

    if (richiesta.Stato !== 'in_attesa') {
      return res.status(400).json({ error: "La richiesta non è più modificabile" });
    }

    const newDataSpesa = dataSpesa || richiesta.DataSpesa;
    const newCategoria = categoria || richiesta.CategoriaID;
    const newImporto = importo || richiesta.Importo;
    const newDescrizione = descrizione || richiesta.Descrizione;

    await conn.query(
      "UPDATE RichiestaRimborso SET DataSpesa = ?, CategoriaID = ?, Importo = ?, Descrizione = ? WHERE RichiestaID = ?",
      [newDataSpesa, newCategoria, newImporto, newDescrizione, idNum]
    );

    return res.json({ success: true, message: "Richiesta aggiornata con successo" });
  } catch (err) {
    next(err);
  }
};

export const deleteRichiesta = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.UtenteID) {
    return res.status(401).json({ error: "Utente non autenticato" });
  }

  const { id } = req.params;
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];
    if (richiesta.DipendenteID !== user.UtenteID) {
      return res.status(403).json({ error: "Non puoi eliminare una richiesta altrui" });
    }

    if (richiesta.Stato !== 'in_attesa') {
      return res.status(400).json({ error: "Solo le richieste in attesa possono essere eliminate" });
    }

    await conn.query("DELETE FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    return res.json({ success: true, message: "Richiesta eliminata con successo" });
  } catch (err) {
    next(err);
  }
};

export const approvaRichiesta = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.UtenteID || user.Ruolo !== 'responsabile') {
    return res.status(403).json({ error: "Accesso riservato ai responsabili" });
  }

  const { id } = req.params;
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];
    if (richiesta.Stato !== 'in_attesa') {
      return res.status(400).json({ error: "La richiesta non è in attesa" });
    }

    await conn.query(
      "UPDATE RichiestaRimborso SET Stato = 'approvato', ResponsabileValutazioneID = ?, DataValutazione = NOW() WHERE RichiestaID = ?",
      [user.UtenteID, idNum]
    );

    return res.json({ success: true, message: "Richiesta approvata con successo" });
  } catch (err) {
    next(err);
  }
};

export const rifiutaRichiesta = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.UtenteID || user.Ruolo !== 'responsabile') {
    return res.status(403).json({ error: "Accesso riservato ai responsabili" });
  }

  const { id } = req.params;
  const { motivazione } = req.body;
  if (!motivazione) {
    return res.status(400).json({ error: "Motivazione del rifiuto obbligatoria" });
  }

  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];
    if (richiesta.Stato !== 'in_attesa') {
      return res.status(400).json({ error: "La richiesta non è in attesa" });
    }

    await conn.query(
      "UPDATE RichiestaRimborso SET Stato = 'rifiutato', ResponsabileValutazioneID = ?, DataValutazione = NOW(), MotivazioneRifiuto = ? WHERE RichiestaID = ?",
      [user.UtenteID, motivazione, idNum]
    );

    return res.json({ success: true, message: "Richiesta rifiutata con successo" });
  } catch (err) {
    next(err);
  }
};

export const liquidaRichiesta = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.UtenteID || user.Ruolo !== 'responsabile') {
    return res.status(403).json({ error: "Accesso riservato ai responsabili" });
  }

  const { id } = req.params;
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "ID richiesta non valido" });
  }

  const conn = await createConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM RichiestaRimborso WHERE RichiestaID = ?", [idNum]);
    const richieste = rows as any[];
    if (richieste.length === 0) {
      return res.status(404).json({ error: "Richiesta non trovata" });
    }

    const richiesta = richieste[0];
    if (richiesta.Stato !== 'approvato') {
      return res.status(400).json({ error: "Solo le richieste approvate possono essere liquidate" });
    }

    await conn.query(
      "UPDATE RichiestaRimborso SET Stato = 'liquidato', DataLiquidazione = CURDATE() WHERE RichiestaID = ?",
      [idNum]
    );

    return res.json({ success: true, message: "Richiesta liquidata con successo" });
  } catch (err) {
    next(err);
  }
};