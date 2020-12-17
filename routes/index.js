import express from "express";
import path from "path";

export const router = express.Router();
export const prefix = '/';

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
