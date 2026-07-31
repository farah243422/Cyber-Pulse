import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mentorRouter from "./mentor";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(mentorRouter);

export default router;
