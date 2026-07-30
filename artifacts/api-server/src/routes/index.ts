import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mentorRouter from "./mentor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mentorRouter);

export default router;
