import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

import TableHeader from './TableHeader';
import DataRow from './DataRow';
import LoadingSkeleton from './LoadingSkeleton';

const Table = ({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  sortConfig,
  onSort,
  onRowClick,
  onPageChange,
  onRowsPerPageChange,
  expandable,
  renderExpandedRow,
  emptyMessage = '데이터가 없습니다.',
  stickyHeader = true,
  dense = false,
  maxHeight,
  loading = false
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleExpandRow = useCallback((rowId) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((event) => {
    onSelectAll?.(event.target.checked);
  }, [onSelectAll]);

  return (
    <Paper elevation={1}>
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHeader
            columns={columns}
            onSelectAll={onSelectAll && handleSelectAll}
            sortConfig={sortConfig}
            onSort={onSort}
            expandable={expandable}
            selectedItems={selectedItems}
            data={data}
          />
          <TableBody>
            {loading ? (
              <LoadingSkeleton 
                columns={columns}
                rowsPerPage={rowsPerPage}
                hasCheckbox={!!onSelectItem}
                hasExpand={expandable}
              />
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <DataRow
                  key={row.id || index}
                  row={row}
                  columns={columns}
                  onSelectItem={onSelectItem}
                  expandable={expandable}
                  onRowClick={onRowClick}
                  selectedItems={selectedItems}
                  isExpanded={expandedRows.has(row.id)}
                  onExpandRow={handleExpandRow}
                  renderExpandedRow={renderExpandedRow}
                />
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onSelectItem ? 1 : 0) + (expandable ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      
      {totalCount > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="페이지당 행 수"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / 전체 ${count}`
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Paper>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  selectedItems: PropTypes.array,
  onSelectItem: PropTypes.func,
  onSelectAll: PropTypes.func,
  sortConfig: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }),
  onSort: PropTypes.func,
  onRowClick: PropTypes.func,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  expandable: PropTypes.bool,
  renderExpandedRow: PropTypes.func,
  emptyMessage: PropTypes.string,
  stickyHeader: PropTypes.bool,
  dense: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.bool
};

export default memo(Table);