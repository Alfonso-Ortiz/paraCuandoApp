const models = require('../database/models');
const { Op } = require('sequelize');
const { CustomError } = require('../utils/helpers');

class CitiesService {
  constructor() {}

  async findAndCount(query) {
    const options = {
      where: {},
    };

    const { limit, offset } = query;
    if (limit && offset) {
      options.limit = limit;
      options.offset = offset;
    }

    const { id } = query;
    if (id) {
      options.where.id = id;
    }

    const { name } = query;
    if (name) {
      options.where.name = { [Op.iLike]: `%${name}%` };
    }

    //Necesario para el findAndCountAll de Sequelize
    options.distinct = true;

    const cities = await models.Cities.scope('view_public').findAndCountAll(
      options
    );
    return cities;
  }

  async createCity({ name }) {
    const transaction = await models.sequelize.transaction();
    try {
      let newCity = await models.Cities.create(
        {
          name,
          state_id,
        },
        { transaction }
      );

      await transaction.commit();
      return newCity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Return Instance if we do not converted to json (or raw:true)
  async getCityOr404(id) {
    let city = await models.Cities.findByPk(id, { raw: true });
    if (!city) throw new CustomError('Not found Cities', 404, 'Not Found');
    return city;
  }

  //Return not an Instance raw:true | we also can converted to Json instead
  async getCity(id) {
    let city = await models.Cities.scope('view_public').findByPk(id);
    if (!city) throw new CustomError('Not found Cities', 404, 'Not Found');
    return city;
  }

  async updateCity(id, obj) {
    const transaction = await models.sequelize.transaction();
    try {
      let city = await models.Cities.scope('view_me').findByPk(id);

      if (!city) throw new CustomError('Not found Cities', 404, 'Not Found');

      let updatedCity = await city.update(obj, { transaction });

      await transaction.commit();

      return updatedCity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeCity(id) {
    const transaction = await models.sequelize.transaction();
    try {
      let city = await models.Cities.findByPk(id);

      if (!city) throw new CustomError('Not found Cities', 404, 'Not Found');

      await city.destroy({ transaction });

      await transaction.commit();

      return city;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = CitiesService;
