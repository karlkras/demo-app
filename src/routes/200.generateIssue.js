import express from "express";
import WFInterface from "../model/WFInterface.js";

const router = express.Router();
const wfApi = new WFInterface();

router.post (
  "/api/issues",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.createIssue(req.body.name);
    res.write(JSON.stringify({"id": theResult.ID}))
    res.end();
  }
)
router.get(
  "/api/issues",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.getIssues();
    res.write(JSON.stringify(theResult))
    res.end();

  }
)
router.get(
  "/api/issues/:id",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.getIssue(req.params.id);
    res.write(JSON.stringify(theResult))
    res.end();

  }
)
router.delete(
  "/api/issues/:id",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.deleteIssue(req.params.id);
    res.write(JSON.stringify(theResult))
    res.end();
  }
)

router.put (
  "/api/issues/:id",
  express.urlencoded({extended: false}),
  async (req, res, next) => {
    const theResult = await wfApi.updateIssue(req.params.id, req.body);
    res.write(JSON.stringify(theResult))
    res.end();
  }
)


export default router;