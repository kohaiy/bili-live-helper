import os from "os";
import path from "path";
import fs from "fs";
import DataUtil from "../data.util";

interface Config {
  test?: string;
}

type CONFIG_KEY = keyof Config;

if (DataUtil.isBrowser()) {
  throw new Error(`[config.util.ts] 不能在渲染线程引用， ${__filename}`);
}

const configDirPath = path.join(os.homedir(), ".bili-live-tool");
const configPath = path.join(configDirPath, "config.json");

export default class ConfigUtil {
  private static config: Config | null = null;

  private static initial() {
    try {
      fs.accessSync(configDirPath);
    } catch (e) {
      fs.mkdirSync(configDirPath);
    }
    try {
      fs.accessSync(configPath);
    } catch (e) {
      fs.writeFileSync(configPath, "{}", { encoding: "utf-8" });
    }
  }

  private static loadConfig(): Config {
    try {
      const configTxt = fs.readFileSync(configPath).toString();
      return JSON.parse(configTxt);
    } catch (e) {
      return {};
    }
  }

  static load() {
    this.initial();
    this.config = this.loadConfig();
    return this.config;
  }

  static get(): Config;
  static get<T = any>(key: CONFIG_KEY): T | undefined;
  static get(key?: CONFIG_KEY): Config | Config[CONFIG_KEY] {
    if (!this.config) this.load();
    if (this.config) {
      if (key) {
        return this.config[key];
      }
      return this.config;
    }

    return {};
  }

  static set(key: CONFIG_KEY, value: any) {
    if (!this.config) this.load();
    if (this.config) {
      this.config[key] = value;
    }
  }

  static save(config: Config) {
    this.config = config;
    fs.writeFileSync(configPath, JSON.stringify(config, null, "  "), {
      encoding: "utf-8"
    });
  }
}
