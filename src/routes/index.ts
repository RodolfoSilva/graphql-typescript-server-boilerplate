import { Request, Response, Router } from 'express';

const router: Router = Router();

router.get('/status', (_: Request, res: Response) => {
  res.send('ok');
});

export default router;
