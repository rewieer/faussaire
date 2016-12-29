// @flow
import StorableException from './exception/storableException';
import { isStorableLink } from './storableLink';

export type StorableData = {
  id: number,
}

export type StorableType = {
  getData: () => StorableData,
  merge: (data: StorableData) => void,
  getSchema: () => Object,
};

export type StorableFactoryType = {
  createStorable: (object: Object) => StorableType
};

/**
 * Return true if the parameter is scalar
 * @param obj
 */
export const isScalar = (obj: any) => (/string|number|boolean/).test(typeof obj);
const checkObjectValues = (object) => {
  Object.keys(object).forEach(key => {
    if(!isScalar(object[key]) && !isStorableLink(object[key]) && object[key] !== null){
      if(typeof object[key] === "object" && !Array.isArray(object[key])){
        checkObjectValues(object[key]);
      } else {
        throw StorableException("A storable object must only have scalar values. Check the value for key " + key);
      }
    }
  });
};

const createTypeObject = (key, value) => {
  return {
    name: key,
    type: typeof value
  }
};

/**
 * Create a Storable from the given object.
 * @param object
 * @returns {Object}
 */
const createStorable = (object: Object): StorableType => {
  if(typeof object !== "object"){
    throw StorableException("The parameter of createStorable must be an object");
  }

  if(!object.hasOwnProperty("id")){
    throw StorableException("A storable must have an ID.");
  }

  checkObjectValues(object);

  return ((entity: Object): StorableType => {
    let _data = Object.assign({}, entity);
    let _schema = {};

    Object.keys(entity).forEach(key => {
      _schema[key] = createTypeObject(key, entity[key])
    });

    return  {
      getData:() : StorableData => _data,
      merge: (data: StorableData) => {
        if(data.id){
          throw StorableException("You can't supply an ID in merge.");
        }

        // TODO : check for the ID key and remove it if it's in
        _data = Object.assign({}, _data, data);
      },
      getSchema:() : Object => _schema,
    };
  })(object);
};

const storableFactory: StorableFactoryType = {
  createStorable
};

export default storableFactory;