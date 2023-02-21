const ArgumentError = require("../../../exception/ArgumentError");
const MyError = require("../../../exception/MyError");
const NotFoundError = require("../../../exception/NotFoundError");
const Room = require("../../../model/room.model");
const Service = require("../../../model/service/service.model");
const Contract = require("../../../model/transaction/contract.model");
const datetimeHelper = require("../../../utils/datetime.helper");
const ServiceDemandValidate = require("../validate/demand.validate");

class ServiceDemandService {

    async createServiceDemand(serviceId, serviceDemandInfo) {
        const service = await Service.findById(serviceId).populate({
            path: 'unit',
            select: 'name'
        });

        if (!service)
            throw new MyError('Not found service!');

        const { basePrice, unit } = service;

        let serviceDemand = await ServiceDemandValidate.validateDemandInfo(serviceId, serviceDemandInfo);

        if (!serviceDemand)
            throw new MyError('Service demand Invalid');

        serviceDemand.amount = this.amountServiceDemand(serviceDemand.type, serviceDemand, basePrice);
        console.log("🚀 ~ file: demand.service.js:23 ~ ServiceDemandService ~ createServiceDemand ~ serviceDemand:", serviceDemand);
        serviceDemand.save();
        return serviceDemand;
    }

    async createServiceDemandForRoom(contractId) {
        if (!(contractId))
            throw new ArgumentError('invoice service ==>');

        const contract = await Contract.getById(contractId);

        let { room, period, dateRent } = contract;
        const rentalDate = datetimeHelper.toObject(dateRent);
        let { expiredDate, services } = ServiceDemandValidate.validateCreateDemandForRoom({ room, period, dateRent });

        const listDemand = [];
        for (let serDemand of services) {
            for (let i = rentalDate.month; i <= expiredDate.month; i++) {
                let atYear = rentalDate.year;
                if (rentalDate.year < expiredDate.year)
                    atYear = expiredDate.year;

                const demand = {
                    newIndicator: 0,
                    quality: 0,
                    atMonth: i,
                    atYear
                };
                listDemand.push(await this.createServiceDemand(serDemand, demand));
            }
        }
        return listDemand;
    }

    amountServiceDemand(type, serviceDemand, basePrice) {
        const QUALITY_TYPE = 0;
        const { oldIndicator, newIndicator, quality } = serviceDemand;
        switch (type) {
            case QUALITY_TYPE:
                return quality * basePrice;
            default:
                return (newIndicator - oldIndicator) * basePrice;
        }
    }

};

module.exports = new ServiceDemandService();

