import JSON5 from 'json5';

export const isJSONString = (str: string): boolean => {
  if (typeof str !== 'string') {
    return false;
  }

  try {
    JSON5.parse(str);

    return true;
  } catch (e) {
    return false;
  }
};
