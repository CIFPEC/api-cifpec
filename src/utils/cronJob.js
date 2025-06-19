import { Op } from "sequelize";
import { SessionModel, UserModel, VerifyModel } from "./../models/index.js";
import { withTransaction } from "./withTransaction.js";

async function deleteUserExpiredSession() {
  return await withTransaction(async (transaction) => {
    // check if session is expired
    const sessions =await SessionModel.findAll({
      where: {
        expiryTime: { [Op.lt]: new Date() }
      },
      transaction
    });

    // check if session is expired
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(session => session.id);
      // delete session where expiryTime < new Date()
      await SessionModel.destroy({
        where: {
          id: { [Op.in]: sessionIds }
        },
        transaction
      });
      console.log("Session deleted");
    }
  },{ERROR_MESSAGE: "FAILED TO CLEAR SESSION TABLE"});
}

async function deleteUserNotVerify() {
  return await withTransaction(async (transaction) => {
    // find all user who has not verify
    const users = await UserModel.findAll({
      where: {
        isVerify: false,
        createdAt: { [Op.lt]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } // get user who created 7 days ago
      }
    });

    if (users && users.length > 0) {
      // get all userId in users
      const userIds = users.map(user => user.id);

      // delete users
      if (userIds.length > 0) {
        await UserModel.destroy({
          where: {
            id: { [Op.in]: userIds }
          }
        });
        console.log(`${userIds.length} users deleted.`);
      } 
    }else {
        console.log("No expired verifies found.");
    }

  },{ERROR_MESSAGE: "FAILED TO CLEAR USER TABLE"});
}

async function clearVerifyTable() {
  return await withTransaction(async (transaction) => {
    // find verify
    const verifys = await VerifyModel.findAll({
      where: {
        created_at: { [Op.lt]: new Date(Date.now() - 1000 * 60 * 60) } // get email who created 1 hour ago
      },
      transaction
    });
  
    // check if verify is expired
    if (verifys && verifys.length > 0) {
      const expiredVerifys = verifys.map(verify => (verify.id));
      await VerifyModel.destroy({
        where: {
          id: { [Op.in]: expiredVerifys }
        },
        transaction
      });
      console.log(`${expiredVerifys.length} expired verifys deleted.`);
    }
  },{ERROR_MESSAGE: "FAILED TO CLEAR VERIFY TABLE"});
}

async function startCronJob() {
  try {
    await deleteUserExpiredSession();
    await deleteUserNotVerify();
    await clearVerifyTable();
  } catch (error) {
    throw error;
  }
}

setInterval(startCronJob, 1000 * 60 * 60 * 24); // run interval every 1 day

