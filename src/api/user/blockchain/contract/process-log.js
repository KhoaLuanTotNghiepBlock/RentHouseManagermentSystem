const { rentHouseContract, eventTopicBugHouse } = require('../../../../utils/blockchain');

module.exports = async (event, chainId) => {
    const eventTopic = event.topics[0];
    try {
        if (eventTopic === eventTopicBugHouse.RentStarted) {
            const decodedEvent = rentHouseContract.interface.decodeEventLog(
                "RentStarted",
                event.data,
                event.topics
            );
            console.log("🚀 ~ file: process-log.js:12 ~ module.exports= ~ decodedEvent:", decodedEvent)
        }

        if (eventTopic === eventTopicBugHouse.RentEnded) {
            const decodedEvent = rentHouseContract.interface.decodeEventLog(
                "RentEnded",
                event.data,
                event.topics
            );
            console.log("🚀 ~ file: process-log.js:21 ~ module.exports= ~ decodedEvent:", decodedEvent)
        }
    } catch (error) {

    }
};