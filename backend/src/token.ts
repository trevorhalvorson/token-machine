import express, { Request, Response, Router } from "express";
import { Contract, ethers, Wallet } from "ethers";
import { AlchemyProvider } from "@ethersproject/providers";

import { Token } from "./contracts/contract-address.json";
import { abi } from "./contracts/Token.json";
import { TypedRequestBody } from "./utils";

const contract: Contract = new ethers.Contract(Token, abi);
const provider: AlchemyProvider = new ethers.providers.AlchemyProvider(
  process.env.ETHERS_PROVIDER_NETWORK,
  process.env.ALCHEMY_API_KEY
);
const privateKey = process.env.PRIVATE_KEY as string;
const wallet = new Wallet(privateKey, provider);
const mintAmount = Number(process.env.MINT_AMOUNT);

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

router.post("/mint", async (req: TypedRequestBody<{ address: string }>, res: Response) => {
  const { address } = req.body;
  if (ethers.utils.isAddress(address)) {
    await contract.connect(wallet).mint(address, mintAmount);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

export default router;
