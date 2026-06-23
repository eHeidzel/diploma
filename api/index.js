import { getApp } from '../src/main';

export default async (req, res) => {
  const app = await getApp();
  app(req, res);
};
