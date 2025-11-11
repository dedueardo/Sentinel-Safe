import { randomBytes, scrypt } from "node:crypto";

function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(8).toString("hex");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function verify(password: string, hashed: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashed.split(":");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

export const AuthHelpers = { hash, verify };
