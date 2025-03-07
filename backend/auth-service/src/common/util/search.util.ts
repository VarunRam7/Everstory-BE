export const createSearchPattern = (escapedSearchString: string) => {
  return {
    $regex: escapedSearchString,
    $options: 'i',
  };
};
