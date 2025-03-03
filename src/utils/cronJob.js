import { Op } from "sequelize";
import { SessionModel, UserModel } from "./../models/index.js";

async function deleteUserExpiredSession() {
  try {
    // delete session where expiryTime < new Date()
    await SessionModel.destroy({ where: { expiryTime: { [Op.lt]: new Date() } } });
    console.log("Session deleted");
  } catch (error) {
    throw error;
  }
}

async function deleteUserNotVerify() {
  try {
    // find all user who has not verify
    const users = await UserModel.findAll({
      where: {
        isVerify: false,
        createdAt: { [Op.lt]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } // get user who created 7 days ago
      }
    });

    if (users.length > 0) {
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
  } catch (error) {
    throw error;
  }
}

async function startCronJob() {
  await deleteUserExpiredSession();
  await deleteUserNotVerify();
}

setInterval(startCronJob, 1000 * 60 * 60 * 24); // run interval every 1 day

