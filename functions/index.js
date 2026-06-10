const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger: Fires when a user logs a new green activity.
 * Action: Securely calculates statistics, updates streak, checks badge rewards,
 *         adds experience points (XP), and handles companion level-up logic.
 */
exports.onActivityCreated = functions.firestore
  .document("users/{userId}/activities/{activityId}")
  .onCreate(async (snapshot, context) => {
    const { userId, activityId } = context.params;
    const activityData = snapshot.data();

    if (!activityData) {
      console.error("No activity data found.");
      return null;
    }

    const { co2SavedKg, category } = activityData;
    const pointsAwarded = Math.max(1, Math.round(co2SavedKg * 10));

    const userRef = db.collection("users").doc(userId);

    try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new Error(`User profile ${userId} does not exist.`);
        }

        const userData = userDoc.data();
        const currentStats = userData.stats || {
          totalCo2SavedKg: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastLoggedDate: null
        };
        const currentBuddy = userData.buddy || {
          name: "Seedling",
          level: 1,
          xp: 0,
          form: "seed"
        };

        // 1. Calculate New Carbon Stats
        const newTotalCo2 = parseFloat((currentStats.totalCo2SavedKg + co2SavedKg).toFixed(2));

        // 2. Calculate Streak Progression
        const todayStr = activityData.localDate || new Date().toISOString().split("T")[0];
        const lastDateStr = currentStats.lastLoggedDate;
        let newStreak = currentStats.currentStreak;

        if (!lastDateStr) {
          newStreak = 1; // First log ever
        } else {
          const lastDate = new Date(lastDateStr);
          const today = new Date(todayStr);
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1; // Logged consecutive day
          } else if (diffDays > 1) {
            newStreak = 1; // Streak broken, restart
          }
          // If diffDays <= 0, user already logged today; streak stays active at current count
        }

        const newLongestStreak = Math.max(newStreak, currentStats.longestStreak || 0);

        // 3. Calculate Companion Level Up (XP threshold = level * 100)
        let newXp = currentBuddy.xp + pointsAwarded * 3;
        let newLevel = currentBuddy.level;
        let newForm = currentBuddy.form;
        let didLevelUp = false;

        let neededXp = newLevel * 100;
        while (newXp >= neededXp) {
          newXp = newXp - neededXp;
          newLevel += 1;
          didLevelUp = true;
          neededXp = newLevel * 100;

          // Determine buddy evolution shape/form
          if (newLevel >= 4) {
            newForm = "flowering_bonsai";
          } else if (newLevel === 3) {
            newForm = "sapling";
          } else if (newLevel === 2) {
            newForm = "sprout";
          }
        }

        // 4. Update the Parent User Profile
        transaction.update(userRef, {
          "stats.totalCo2SavedKg": newTotalCo2,
          "stats.currentStreak": newStreak,
          "stats.longestStreak": newLongestStreak,
          "stats.lastLoggedDate": todayStr,
          "buddy.level": newLevel,
          "buddy.xp": newXp,
          "buddy.form": newForm,
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 5. If leveled up, trigger notification subcollection log
        if (didLevelUp) {
          const notificationRef = userRef.collection("notifications").doc();
          transaction.set(notificationRef, {
            title: "Companion Evolved! 🌟",
            body: `Congratulations! Your buddy grew into a ${newForm.replace("_", " ")} and reached Level ${newLevel}!`,
            type: "level_up",
            isRead: false,
            sentAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });

      console.log(`Successfully calculated metrics for user ${userId} and activity ${activityId}`);
    } catch (error) {
      console.error("Transaction failed: ", error);
    }

    return null;
  });

/**
 * Scheduled Cron Job: Aggregates total user carbon savings every 10 minutes
 *                     and writes to the global cached leaderboard document.
 *                     This scales leaderboard requests to millions of users
 *                     with minimal document read/write costs.
 */
exports.aggregateGlobalLeaderboard = functions.pubsub
  .schedule("every 10 minutes")
  .onRun(async (context) => {
    const usersSnapshot = await db
      .collection("users")
      .orderBy("stats.totalCo2SavedKg", "desc")
      .limit(50)
      .get();

    const topPlayers = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const stats = data.stats || {};
      const buddy = data.buddy || {};
      topPlayers.push({
        uid: doc.id,
        name: data.displayName || "Eco Hero",
        xp: Math.round(stats.totalCo2SavedKg * 10),
        avatar: buddy.form === "flowering_bonsai" ? "🌳" : buddy.form === "sapling" ? "🌿" : "🌱"
      });
    });

    const leaderboardRef = db.collection("leaderboards").doc("global_cohort");
    await leaderboardRef.set({
      type: "global",
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      topPlayers
    });

    console.log("Global leaderboard aggregated successfully.");
    return null;
  });
