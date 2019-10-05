import BaseModel from './BaseModel';
import Trip from './Trip';

export default class Booking extends BaseModel {
  constructor(rowItem) {
    super(rowItem);
    if (rowItem.trip) {
      this.trip = new Trip(rowItem.trip);
    }
  }

  static get tableName() {
    return 'bookings';
  }

  static get primaryKeyName() {
    return 'id';
  }

  static get columnRelations() {
    return [Trip];
  }

  static get softDelete() {
    return true;
  }

  static get fieldNames() {
    return [
      'id',
      'userEmail',
      'phone',
      'tripId',
      'numberOfSeats',
      'unusedTicketCodes',
      'usedTicketCodes',
      'status'
    ];
  }
}
