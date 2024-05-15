import crypto from "crypto";
import * as fs from "fs";
import { PathLike } from "graceful-fs";
import inquirer from "inquirer";
import path from "path";
import {
  hackmudSaveData,
  hackmudScriptData,
  userData,
  writeToSaveData,
} from "./json_saver.js";

async function run() {
  try {
    let newSaveData: hackmudSaveData = {
      hackmudPath: "",
      users: [],
    };
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "hackmud_dir",
        message: "What's your Hackmud directory?",
        default: "/home/ninh/.config/hackmud",
      },
    ]);

    const users: userData[] = await new Promise(async (resolve, reject) => {
      const UsrhackmudPath: string = answers.hackmud_dir;
      newSaveData.hackmudPath = UsrhackmudPath;

      const stats = await fs.promises.stat(UsrhackmudPath);
      if (!stats.isDirectory()) {
        reject("Provide Path is not a directory.");
      }

      const files = await fs.promises.readdir(UsrhackmudPath);
      const userKeys = files
        .filter((file) => path.extname(file) === ".key")
        .map((file) => path.basename(file, ".key"));

      const existingUserDirs = await Promise.all(
        userKeys.map(async (userKey) => {
          const dirPath = path.join(UsrhackmudPath, userKey);
          try {
            const userStats = await fs.promises.stat(dirPath);
            if (userStats.isDirectory()) {
              return userKey;
            }
          } catch (err) {
            return null;
          }
        })
      );
      const finalDirs = existingUserDirs.filter((dirs) => dirs !== null);

      const finalUserData: userData[] = [];

      for (const currentUser of finalDirs) {
        const tempUserData: userData = {
          user: currentUser,
          uploaded_scripts: [],
        };

        const scriptsPath: string = path.join(
          UsrhackmudPath,
          currentUser,
          "/scripts/"
        );
        try {
          const scripts = await fs.promises.readdir(scriptsPath);

          for (const script of scripts) {
            const fd = fs.createReadStream(path.join(scriptsPath, script));
            const sha1 = crypto.createHash("sha1");
            const tempScriptData: hackmudScriptData = {
              name: script,
              fileHash: "",
            };
            sha1.setEncoding("base64");

            fd.on("end", () => {
              sha1.end();
            });

            fd.on("error", (error) => {
              console.error("Error reading file:", error);
            });

            fd.pipe(sha1);

            const hashPromise = new Promise((resolve) => {
              sha1.on("finish", () => {
                const hash = String(sha1.read());
                resolve(hash);
              });
            });
            await hashPromise.then((hash: string) => {
              tempScriptData.fileHash = hash;
            });
            tempUserData.uploaded_scripts.push(tempScriptData);
          }

          finalUserData.push(tempUserData);
        } catch (error) {
          console.error("Error reading directory:", error);
        }
      }

      resolve(finalUserData);
    });

    newSaveData.users = users;
    const dirPath = path
      .dirname(new URL(import.meta.url).pathname)
      .replace("dist", "");
    writeToSaveData(dirPath + ".env", newSaveData);
  } catch (error) {
    console.log(error.message);
    await run();
  }
}

run();
