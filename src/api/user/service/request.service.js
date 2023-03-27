const Request = require('../../../model/user/request.model');

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
            .populate([
                {
                    path: "from",
                    select: '-updatedAt'
                },
                {
                    path: "to",
                    select: '-updatedAt'
                },
            ])
            .lean(),
        Request.countDocuments(filter),
    ]);
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

module.exports = RequestService;