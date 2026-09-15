export function paginate(items, currentPage, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);
  const startItem = totalItems === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, totalItems);
  return {
    currentItems,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    startItem,
    endItem,
  };
}
