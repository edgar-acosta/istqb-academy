import { getDb } from "../api/queries/connection.js";

// No hay datos semilla: la primera cuenta que se registra en /login
// queda como administradora. Este script solo verifica que la base
// SQLite se crea y que las tablas existen.
async function seed() {
  getDb();
  console.log("Base SQLite lista en data/istqb.db. Regístrate en /login.");
  process.exit(0);
}

seed();
