import React, { memo } from 'react';
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox
} from '@mui/material';

const TableHeader = memo(({
  columns,
  onSelectAll,
  sortConfig,
  onSort,
  expandable,
  selectedItems,
  data
}) => (
  <TableHead>
    <TableRow>
      {onSelectAll && (
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
            checked={data.length > 0 && selectedItems.length === data.length}
            onChange={onSelectAll}
          />
        </TableCell>
      )}
      {expandable && <TableCell padding="checkbox" />}
      {columns.map((column) => (
        <TableCell
          key={column.id}
          align={column.numeric ? 'right' : 'left'}
          padding={column.disablePadding ? 'none' : 'normal'}
          sortDirection={sortConfig?.field === column.id ? sortConfig.direction : false}
          sx={column.width ? { width: column.width } : {}}
        >
          {column.sortable !== false && onSort ? (
            <TableSortLabel
              active={sortConfig?.field === column.id}
              direction={sortConfig?.field === column.id ? sortConfig.direction : 'asc'}
              onClick={() => onSort(column.id)}
            >
              {column.label}
            </TableSortLabel>
          ) : (
            column.label
          )}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
));

export default TableHeader;
