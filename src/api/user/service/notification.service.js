const Notification = require("../../../model/user/notification.model");

const NotificationService = {};

NotificationService.getListNotification = async (
    conditions = {},
    pagination,
    sort = {},
) => {
    const filter = { ...conditions };
    const { limit, page, skip } = pagination;
    delete filter.limit;
    delete filter.page;

    const [items, total] = await Promise.all([
        Notification.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate([
                {
                    path: 'userOwner',
                    select: "_id username avatar phone email wallet"
                },
                {
                    path: 'receiveUser',
                    select: "_id username avatar phone email wallet"
                }
            ])
            .lean(),
        Notification.countDocuments(filter),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

module.exports = NotificationService;