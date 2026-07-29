export const PAGE_SIZE = 10;

export function paginate<T>(items: T[], requestedPage: number) {
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const page = Math.min(
    Math.max(requestedPage, 0),
    Math.max(pageCount - 1, 0),
  );

  return {
    items: items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    page,
    pageCount,
  };
}
