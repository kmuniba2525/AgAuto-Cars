import express from "express";
import { generateSitemap } from "../controllers/sitemapController.js";

const sitemapRouter = express.Router();

sitemapRouter.get("/sitemap.xml", generateSitemap);

export default sitemapRouter;