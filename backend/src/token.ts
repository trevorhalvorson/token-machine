import express, { Request, Response, Router } from "express";
import { Contract, ethers, Wallet } from "ethers";
import { AlchemyProvider } from "@ethersproject/providers";
import { verify } from 'hcaptcha';

import { Token } from "./contracts/contract-address.json";
import { abi } from "./contracts/Token.json";
import { TypedRequestBody } from "./utils";

const contract: Contract = new ethers.Contract(Token, abi);
const provider: AlchemyProvider = new ethers.providers.AlchemyProvider(
  process.env.ETHERS_PROVIDER_NETWORK!,
  process.env.ALCHEMY_API_KEY!
);
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
const mintAmount = Number(process.env.MINT_AMOUNT!);

const router: Router = express.Router();

router.get("/cap", async (req: Request, res: Response) => {
  const cap: string = (await contract.connect(provider).cap()).toString();
  res.json({ cap });
});

router.get("/supply", async (req: Request, res: Response) => {
  const supply: string = (await contract.connect(provider).totalSupply()).toString();
  res.json({ supply });
});

router.get("/price", async (req: Request, res: Response) => {
  res.sendStatus(404);
});

router.post("/mint", async (req: TypedRequestBody<{ address: string, token: string }>, res: Response) => {
  const { address, token } = req.body;
  if (!ethers.utils.isAddress(address) || token == null) {
    res.sendStatus(400);
    return;
  }
  try {
    const result = await verify(process.env.HCAPTCHA_SECRET!, token);
    if (!result.success) {
      console.log(`hcaptcha token verification failed: ${result["error-codes"]}`);
      res.sendStatus(400);
      return;
    }
  } catch (error) {
      console.log(`hcaptcha error: ${error}`);
      res.sendStatus(500);
      return;
  }
  try {
    const transaction = await contract.connect(wallet).mint(address, mintAmount);
    res.status(200).json({ hash: transaction.hash });
    return;
  } catch (error) {
    console.log(`mint failed: ${error}`);
    res.sendStatus(500);
    return;
  }
});

export default router;
