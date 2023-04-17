import { knex } from "knex"
// Facilitar as buscas no meu SQL , e também deixa os meus dados mas confiaveis
// Criptografando meus dados, ajuda evitar injeçoes DLL
export const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./src/database/labecommerce.db", //localização do seu arquivo .db
  },
  useNullAsDefault: true, // definirá NULL quando encontrar valores undefined
  pool: {
    min: 0,
    max: 10, // aumentar o tamanho do pool de conexões
    afterCreate: (conn: any, cb: any) => {
      conn.run("PRAGMA foreign_keys = ON", cb)
    } // configurando para o knex forçar o check das constrainst FK
  },
  migrations: {
    directory: "./src/database" // diretório de migrações
  }
})
