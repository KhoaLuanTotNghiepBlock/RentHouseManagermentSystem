const cron = require('node-cron');
const scheduleNotifyService = require('../api/user/service/schedule-notify.service');
// // 8AM on thr 15th day every month
// cron.schedule('0 8 15 * *', () => {
//     console.log('This cron job runs on the 15th day of every month at 8:00 AM');
// });

// cron.schedule('5 * * * * *', () => {
//     // Code to execute every day at midnight
//     console.log('This cron is run');
// });

const cronSchedule = {
    sendMailToNotifyAboutServiceDemand: async (time) => {
        cron.schedule(time, async () => {
            await scheduleNotifyService.createNotifyToLessor();
            console.log('main is send');
        });
    }
}
module.exports = cronSchedule;