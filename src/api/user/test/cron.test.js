const cron = require('../../../config/cron');
// const jest = require('jest');
// const cron = require('node-cron');


describe('Test cron job', () => {
    test('should execute the cron job function every day at 8:00 AM', () => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(new Date('2022-02-07T08:00:00.000Z')); // Set the system time to 8:00 AM

        const mockFn = jest.fn();
        cron.schedule('0 8 * * *', () => {
            // Code to execute every day at midnight
            console.log('This cron is run');
        }); // Schedule the cron job

        jest.advanceTimersByTime(24 * 60 * 60 * 1000); // Advance the system time by 24 hours

        expect(mockFn).toHaveBeenCalledTimes(1); // Check if the cron job function was executed once
    });
});