import dotEnv from "dotenv";
import * as fs from "fs";
import inquirer from "inquirer";
import path from "path";
import process from "process";
import * as envUtil from "./envUtil.js";

async function run() {
  if (!fs.existsSync("./.env")) {
    fs.writeFileSync("./.env", "");
  }
  dotEnv.config({ path: path.resolve("./.env") });
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "hackmud_dir",
        message: "What's your Hackmud directory?",
      },
    ]);

    const users: Array<String> = await new Promise((resolve, reject) => {
      const hackmudPath: string = answers.hackmud_dir;
      fs.stat(hackmudPath, async (err, stats) => {
        if (err || !stats.isDirectory()) {
          console.log(stats);
          reject(err || new Error("Provided path is not a directory."));
          return;
        }

        const files = await fs.promises.readdir(hackmudPath);

        const userDirs = files
          .filter((file) => path.extname(file) === ".key")
          .map((file) => path.basename(file, ".key"));

        if (userDirs.length == 0) {
          reject(new Error("${hackmudPath} has no Users"));
        }
        resolve(userDirs);
      });
    });

    envUtil.updateEnvFile("./.env", "users=" + users.toString());
  } catch (error) {
    console.log(error.message);
    await run();
  }
}

run();
