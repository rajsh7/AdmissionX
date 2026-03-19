import mysql from "mysql2/promise";

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "admissionx",
  });

  try {
    const [[users]] = await conn.query("SHOW CREATE TABLE users") as [any[], any];
    const uDef = users['Create Table'];
    console.log("Users PK/Engine/Collate:", uDef.match(/PRIMARY KEY \((.*?)\)/)?.[0], uDef.match(/ENGINE=(.*?)(?= )/)?.[0], uDef.match(/COLLATE=(.*?)(?= )/)?.[0]);

    const [[collegeprofile]] = await conn.query("SHOW CREATE TABLE collegeprofile") as [any[], any];
    const cpDef = collegeprofile['Create Table'];
    console.log("CollegeProfile PK/Engine/Collate:", cpDef.match(/PRIMARY KEY \((.*?)\)/)?.[0], cpDef.match(/ENGINE=(.*?)(?= )/)?.[0], cpDef.match(/COLLATE=(.*?)(?= )/)?.[0]);

    const [[course]] = await conn.query("SHOW CREATE TABLE course") as [any[], any];
    const coDef = course['Create Table'];
    console.log("Course PK/Engine/Collate:", coDef.match(/PRIMARY KEY \((.*?)\)/)?.[0], coDef.match(/ENGINE=(.*?)(?= )/)?.[0], coDef.match(/COLLATE=(.*?)(?= )/)?.[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

check();
