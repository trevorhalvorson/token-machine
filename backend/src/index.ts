import 'dotenv/config';
import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";

import token from "./token";

const app: Application = express();

const port = process.env.PORT || 3333;

app.use(cors())
app.use(bodyParser.json());
app.use("/token", token);

app.get("/healthcheck", async (req: Request, res: Response) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
