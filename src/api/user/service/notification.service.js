const NotificationService = {};
const Notification = require('../../../model/user/notification.model');


NotificationService.getAll = async (
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
        Notification.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate([
                {
                    path: 'userOwner',
                    select: '-updatedAt'
                },
                {
                    path: 'tag',
                    select: '-updatedAt'
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
}
module.exports = NotificationService;