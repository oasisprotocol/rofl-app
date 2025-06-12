import { getOperationId } from '@orval/core';

/** @type {import('@orval/core').OverrideOutput['operationName']} */
const removeNetworkFromName = (operation, route, verb) => {
  return getOperationId(operation, route.replace('/${network}', ''), verb);
};

export default removeNetworkFromName;
