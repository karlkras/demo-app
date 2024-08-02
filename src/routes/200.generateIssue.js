import express from "express";
import WFInterface from "../model/WFInterface.js";

const router = express.Router();
const wfApi = new WFInterface();

router.post (
  "/api/issue",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.createIssue(req.body.name);
    res.write(JSON.stringify({"id": theResult.message.data.ID}))
    res.end();
  }
)
export default router;