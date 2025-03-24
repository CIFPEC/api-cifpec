import { Database } from "./../models/index.js";

export async function withTransaction(callback, {externalTransaction = null, ERROR_MESSAGE = null}) {
  const transaction = externalTransaction || await Database.transaction();

  try {
    const result = await callback(transaction);

    // hanya commit kalau bukan dari luar
    if (!externalTransaction) {
      await transaction.commit();
    }

    return result;
  } catch (err) {
    console.log(`${ERROR_MESSAGE}: `, err);
    if (!externalTransaction) {
      await transaction.rollback();
    }
    throw err;
  }
}
