import fs from "graceful-fs";

export interface hackmudScriptData {
  name: string;
  fileHash: string;
}

export interface userData {
  user: string;
  uploaded_scripts: hackmudScriptData[];
}

export interface hackmudSaveData {
  hackmudPath: string;
  users: userData[];
}

export async function writeToSaveData(
  filePath: string,
  save_data: hackmudSaveData
) {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(save_data), "utf-8");
    console.log("Saved file to", filePath);
  } catch (e) {
    console.error(e);
  }
}

export function getSaveDataFromFile(filePath: string): hackmudSaveData {
  let saveFileData: hackmudSaveData;

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    try {
      const saveData: hackmudSaveData = JSON.parse(data);
      saveFileData = saveData;
    } catch (err) {
      console.error(err);
    }
  });

  return saveFileData;
}
