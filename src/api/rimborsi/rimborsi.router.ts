import { Router } from "express";
import { isAuthentificated } from "../../lib/auth/local/auth.middleware";
import { addRichiesta, approvaRichiesta, deleteRichiesta, getAllRimborsi, getRimborsoById, liquidaRichiesta, rifiutaRichiesta, updateRichiesta } from "./rimborsi.controller";

const router = Router();

router.use(isAuthentificated);

router.get('', getAllRimborsi);
router.get('/:id', getRimborsoById)
router.post('', addRichiesta);

router.put('/:id', updateRichiesta);
router.delete('/:id', deleteRichiesta);

router.put('/:id/approva', approvaRichiesta);
router.put('/:id/rifiuta', rifiutaRichiesta);
router.put('/:id/liquida', liquidaRichiesta);

export default router;