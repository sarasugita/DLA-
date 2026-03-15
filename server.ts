import express from "express";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // DLA Evaluation API
  app.post("/api/evaluate", (req, res) => {
    const { transcript } = req.body;
    
    // Pythonスクリプトを実行して評価を行う
    // 本来は引数としてtranscriptを渡すが、ここでは簡易化のため
    // app/main_pipeline.py を実行してその出力を取得する
    // main_pipeline.py が JSON を出力するように修正する必要がある
    
    const pythonProcess = exec("PYTHONPATH=. python3 app/main_pipeline.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`[PYTHON ERROR] exec error: ${error}`);
        console.error(`[PYTHON STDERR] ${stderr}`);
        return res.status(500).json({ error: "Evaluation engine failed", details: stderr });
      }
      
      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (e) {
        console.error("Failed to parse Python output:", stdout);
        res.status(500).json({ error: "Failed to parse evaluation result" });
      }
    });

    // トランスクリプトを標準入力として渡す
    if (pythonProcess.stdin) {
      pythonProcess.stdin.write(JSON.stringify({ transcript }));
      pythonProcess.stdin.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] DLA Evaluation Engine started successfully`);
    console.log(`[SERVER] Local: http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
