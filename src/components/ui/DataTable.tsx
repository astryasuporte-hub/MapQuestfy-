import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  mobileHide?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  emptyFallback,
  renderMobileCard,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  emptyFallback?: React.ReactNode;
  renderMobileCard?: (row: T) => React.ReactNode;
}) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const fn = col.sortValue;
    return [...data].sort((a, b) => {
      const av = fn(a);
      const bv = fn(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, columns, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (data.length === 0 && emptyFallback) {
    return <>{emptyFallback}</>;
  }

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div>
      {/* Mobile card list when provided */}
      {renderMobileCard && (
        <div className="md:hidden space-y-3">
          {sortedData.map((row) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 ${
                onRowClick ? 'cursor-pointer hover:border-[#A3FF12]/40' : ''
              }`}
            >
              {renderMobileCard(row)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop / Tablet Table */}
      <div className={`${renderMobileCard ? 'hidden md:block' : 'block'} overflow-x-auto`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#29332C] text-xs font-medium text-[#9DA89F]">
              {selectable && (
                <th className="py-3 pl-3 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Selecionar todos"
                    className="rounded border-[#29332C] bg-[#0B0F0C] accent-[#A3FF12] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-3 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.sortable && col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[#F5F7F5] transition-colors cursor-pointer"
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#A3FF12]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#A3FF12]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29332C]/70 text-sm">
            {sortedData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-[#171D18]/75' : 'hover:bg-[#171D18]/40'
                }`}
              >
                {selectable && (
                  <td
                    className="py-3 pl-3 pr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => onToggleSelect?.(row.id)}
                      aria-label="Selecionar linha"
                      className="rounded border-[#29332C] bg-[#0B0F0C] accent-[#A3FF12] cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-3 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
