export const createEnum = (listOfKeys) => {
  const enm = {};
  for (let i = 0; i < listOfKeys.length; i++) {
    enm[listOfKeys[i]] = listOfKeys[i].toLowerCase();
  }

  return Object.freeze(enm);
}
