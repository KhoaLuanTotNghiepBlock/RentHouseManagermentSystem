const Request = require('../../../model/user/request.model');
const userService = require('./user.service');
const RequestService = {};

RequestService.getAll = async (
    conditions = {},
    pagination,
    projection,
    sort = {}
) => {
    const filter = { ...conditions };
    const { limit, page, skip } = pagination;
    delete filter.limit;
    delete filter.page;

    const [items, total] = await Promise.all([
        Request.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Request.countDocuments(filter),
    ]);

    const array = items.map((val) => {
        const requets = { requestId: val._id, roomId: val?.data?.contract?.room === undefined ? val?.data?.room._id : val?.data?.contract?.room, type: val.type }
        return requets;
    })
    return {
        items: array,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

RequestService.excuteCancelContract = async (requestId) => {
    return await userService.acceptCancelRentalRoom(null, requestId);
};

RequestService.excuteExtendsContract = async (ownerId, requestId) => {
    return await userService.extendContract(requestId);
};

RequestService.executeRequestInDue = async () => {
    /**
     * 1. get date
     * 2. check request due
     * 3. auto accept request in due
     */
    const dateRequest = new Date();

    const requests = await Request.find({}).lean();

    for (let i = 0; i < requests.length; i++) {
        if (requests[i].endDate <= dateRequest) {
            if (requests[i].type === 'CANCEL_RENTAL') {
                await RequestService.excuteCancelContract(requests[i]._id);
            }
            else {
                await RequestService.excuteExtendsContract(requests[i]._id);
            }
        }
    }
    console.log('check request end');
};
module.exports = RequestService;