import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import browseRouter from "./browse";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(browseRouter);

export default router;
