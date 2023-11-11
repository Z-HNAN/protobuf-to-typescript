import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from 'child_process';

export default function handler(req:NextApiRequest, res: NextApiResponse) {
  const command = req.body.command; // 从请求中获取要执行的命令

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return res.status(500).json({ error: `执行的错误: ${error.message}` });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }
    res.status(200).json({ output: stdout });
  });
}
