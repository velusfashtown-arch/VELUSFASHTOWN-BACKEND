const BaseRepository = require('../../../BaseRepository');
const Master = require('../../../../models/admin/Products/Masters/Master');

class MasterRepository extends BaseRepository {
  constructor() {
    super(Master);
  }

  /**
   * Give legacy master records (created before this field existed) an
   * app-generated public ID. Uses the raw driver, not this.model.updateOne
   * — masterId is `immutable: true`, so Mongoose's query-casting silently
   * drops it from a $set on an existing document, which would make this
   * a permanent no-op.
   */
  async ensureMasterIds() {
    const masters = await this.model.find({ masterId: { $exists: false } }).select('_id').lean();
    if (!masters.length) return;
    await Promise.all(masters.map((master) => this.model.collection.updateOne(
      { _id: master._id },
      { $set: { masterId: this.model.generateMasterId() } }
    )));
  }

}

module.exports = new MasterRepository();
