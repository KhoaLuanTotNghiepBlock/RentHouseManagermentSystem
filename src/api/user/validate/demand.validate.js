const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const NotFoundError = require("../../../exception/NotFoundError");
const ServiceDemand = require("../../../model/service/service-demand.model");
const Service = require("../../../model/service/service.model");
const commonHelper = require("../../../utils/common.helper");
const datetimeHelper = require("../../../utils/datetime.helper");

const ServiceDemandValidate = {

    validateDemandInfo: async (serviceId, serviceDemandInfo) => {
        if (!(serviceId && serviceDemandInfo))
            throw new ArgumentError('validate service demand ==>');
        let { newIndicator, quality, atMonth, atYear } = serviceDemandInfo;

        const service = await Service.findById(serviceId).populate({
            path: 'unit',
            select: 'name'
        });
        if (!service)
            throw new NotFoundError('validate service demand => service');
        const { unit } = service;

        newIndicator = commonHelper.convertToNumber(newIndicator);
        quality = commonHelper.convertToNumber(quality);
        atMonth = commonHelper.convertToNumber(atMonth);
        atYear = commonHelper.convertToNumber(atYear);

        let oldIndicator = 0;
        const newestDemand = await ServiceDemand.getNewestservice(serviceId);
        // if have service demand
        if (newestDemand)
            oldIndicator = newestDemand.newIndicator;

        const type = ServiceDemandValidate.checkDemandType(unit.name);

        return new ServiceDemand({
            oldIndicator,
            newIndicator,
            quality,
            atMonth,
            atYear,
            type,
            service: service._id,
            enable: true
        });
    },

    checkDemandType: (unit) => {
        const KWh = 'kWh';
        const QUALITY_TYPE = 0;
        const INDICATTOR_TYPE = 1;
        switch (unit) {
            case KWh:
                return INDICATTOR_TYPE;
            default:
                return QUALITY_TYPE;
        }
    },

    validateCreateDemandForRoom: ({ room, period, dateRent }) => {
        const expiredDate = dateRent;
        console.log("🚀 ~ file: demand.validate.js:72 ~ dateRent:", dateRent)

        expiredDate.setMonth(expiredDate.getMonth() + period);
        console.log("🚀 ~ file: demand.validate.js:65 ~ expiredDate:", expiredDate)
        if (!expiredDate)
            throw new MyError('validate demand ==> expired date invalid');
        const { services } = room;
        if (!services)
            throw new MyError('validate demand => services invalid');

        return {
            expiredDate: datetimeHelper.toObject(expiredDate),
            services
        }
    }
};

module.exports = ServiceDemandValidate;